import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { filterPosProducts, resolveScan } from '../lib/resolve-scan'

const item = (id, name, sku, barcode, typeId, typeName, stock = 5) => ({
  id, name, sku, barcode, typeId, typeName, unitId: 'u1', unitName: 'əd.', unitPrice: 10, stock,
})

const catalog = [
  item('p1', 'Double Sweatshirt (S)', 'MHS-001', 'KHZ-VWSW-DBL-S', 't-sweat', 'Sweatshirt'),
  item('p2', 'Yun palto', 'MHS-002', '2000000000011', 't-coat', 'Palto'),
  item('p3', 'Usaq Hoodie', 'MHS-003', '2075565192673', 't-kids', 'Uşaq'),
  item('p4', 'Şərf', 'MHS-004', 'KHZ-SCRF-1', 't-acc', 'Aksesuar'),
]

describe('resolveScan', () => {
  it('finds an exact barcode or product code ignoring case and spaces', () => {
    expect(resolveScan(catalog, ' khz-vwsw-dbl-s ')).toMatchObject({ kind: 'exact', product: { id: 'p1' } })
    expect(resolveScan(catalog, '2075565192673').product.id).toBe('p3')
    expect(resolveScan(catalog, 'mhs-002').kind).toBe('exact')
  })

  it('picks the one product a partial text fits, reports several, or none', () => {
    expect(resolveScan(catalog, 'vwsw')).toMatchObject({ kind: 'single', product: { id: 'p1' } })
    expect(resolveScan(catalog, 'khz')).toMatchObject({ kind: 'many', count: 2 })
    expect(resolveScan(catalog, 'yoxdur')).toMatchObject({ kind: 'none', count: 0 })
  })
})

describe('filterPosProducts', () => {
  it('searches every category, and applies the category only when nothing is typed', () => {
    expect(filterPosProducts(catalog, 'khz-vwsw', 't-coat').map((p) => p.id)).toEqual(['p1'])
    expect(filterPosProducts(catalog, '  ', 't-coat').map((p) => p.id)).toEqual(['p2'])
    expect(filterPosProducts(catalog, '', '')).toHaveLength(4)
  })
})

vi.mock('@/features/pos/api/use-pos-catalog', async (importOriginal) => ({
  ...(await importOriginal()),
  usePosCatalog: () => ({ catalog, isLoading: false }),
}))
vi.mock('@/features/stores/api/use-stores', () => ({
  useStores: () => ({ stores: [{ id: 's1', name: 'Mağaza 1', warehouseId: 'w1' }] }),
}))
vi.mock('@/features/products/api/use-product-types', () => ({
  useProductTypes: () => ({
    types: [
      { id: 't-sweat', name: 'Sweatshirt' },
      { id: 't-coat', name: 'Palto' },
    ],
  }),
}))
vi.mock('@/store/cash-registers-store', () => ({
  useCashRegistersStore: () => ({ cashRegisters: [], isLoading: false }),
}))
vi.mock('@/features/pos/api/lookup-barcode', () => ({ lookupBarcode: vi.fn() }))
vi.mock('@/features/pos/api/checkout-pos', () => ({ checkoutPos: vi.fn() }))
vi.mock('@/hooks/use-document-title', () => ({ useDocumentTitle: () => {} }))

const { lookupBarcode } = await import('@/features/pos/api/lookup-barcode')
const { PosPage } = await import('../pages/PosPage')
const { useToastStore, dismissToast } = await import('@/store/toast-store')

function Toasts() {
  return useToastStore().toasts.map((toast) => <p key={toast.id} role="status">{toast.message}</p>)
}

async function openTill() {
  const user = userEvent.setup()
  render(
    <>
      <PosPage />
      <Toasts />
    </>,
  )
  await user.click(screen.getByRole('button', { name: /Mağaza 1/ }))
  return user
}

beforeEach(() => {
  vi.mocked(lookupBarcode).mockReset().mockResolvedValue(null)
})

describe('PosPage barcode box', () => {
  it('adds the product on Enter even when another category is selected, then clears and keeps focus', async () => {
    const user = await openTill()
    await user.click(screen.getByRole('button', { name: 'Palto' }))

    const box = screen.getByPlaceholderText(/Oxudun/)
    await user.type(box, 'khz-vwsw-dbl-s{Enter}')

    expect(await screen.findAllByText('Double Sweatshirt (S)')).not.toHaveLength(0)
    expect(box).toHaveValue('')
    expect(box).toHaveFocus()
    expect(screen.queryByText('Barkod tapılmadı.')).not.toBeInTheDocument()
  })

  it('adds the only product a partial text fits', async () => {
    const user = await openTill()

    await user.type(screen.getByPlaceholderText(/Oxudun/), 'vwsw{Enter}')

    expect(await screen.findAllByText('Double Sweatshirt (S)')).not.toHaveLength(0)
    expect(screen.getByPlaceholderText(/Oxudun/)).toHaveValue('')
  })

  it('shows a toast and adds nothing when nothing matches', async () => {
    const user = await openTill()

    await user.type(screen.getByPlaceholderText(/Oxudun/), 'yoxdur{Enter}')

    expect(await screen.findByRole('status')).toHaveTextContent('Barkod tapılmadı.')
    expect(screen.getByPlaceholderText(/Oxudun/)).toHaveValue('yoxdur')
    dismissToast(1)
  })
})
