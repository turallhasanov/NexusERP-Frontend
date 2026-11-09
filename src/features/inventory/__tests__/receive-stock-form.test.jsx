import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { findExactProduct, searchProducts } from '../lib/product-search'

const products = [
  { id: 'p1', name: 'Yun palto', sku: 'MHS-001', barcode: '2000000000011', quantity: 3, unitId: 'u1' },
  { id: 'p2', name: 'Şərf', sku: 'MHS-002', barcode: 'KHZ-DFCT-BLK-S', quantity: 0, unitId: 'u1' },
  { id: 'p3', name: 'Usaq Hoodie (S)', sku: 'MHS-003', barcode: '2075565192673', quantity: 1, unitId: 'u1' },
]

vi.mock('@/store/inventory-store', () => ({ useInventoryStore: () => ({ products }) }))
vi.mock('@/store/warehouses-store', () => ({ useWarehousesStore: () => ({ warehouses: [{ id: 'w1', name: 'Ana anbar' }] }) }))
vi.mock('@/store/product-units-store', () => ({ formatQuantity: (quantity) => `${quantity} əd.` }))
vi.mock('@/features/inventory/api/receive-stock', () => ({ addStock: vi.fn() }))

const { addStock } = await import('@/features/inventory/api/receive-stock')
const { ReceiveStockForm } = await import('../components/ReceiveStockForm')

beforeEach(() => {
  vi.mocked(addStock).mockResolvedValue({ ok: true })
})

describe('product search', () => {
  it('matches name, product code and barcode, folding Azerbaijani letters', () => {
    expect(searchProducts(products, 'palt').map((p) => p.id)).toEqual(['p1'])
    expect(searchProducts(products, 'serf').map((p) => p.id)).toEqual(['p2'])
    expect(searchProducts(products, 'mhs-003').map((p) => p.id)).toEqual(['p3'])
    expect(searchProducts(products, 'khz-dfct').map((p) => p.id)).toEqual(['p2'])
    expect(searchProducts(products, '')).toHaveLength(3)
  })

  it('finds a product only by an exact barcode or code', () => {
    expect(findExactProduct(products, ' khz-dfct-blk-s ')?.id).toBe('p2')
    expect(findExactProduct(products, 'MHS-001')?.id).toBe('p1')
    expect(findExactProduct(products, 'KHZ-DFCT')).toBeNull()
  })
})

describe('ReceiveStockForm product picker', () => {
  it('filters as you type and selects with a click', async () => {
    const user = userEvent.setup()
    render(<ReceiveStockForm />)

    await user.click(screen.getByRole('combobox', { name: 'Məhsul' }))
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(3)

    await user.type(screen.getByRole('combobox', { name: 'Məhsul' }), 'hoo')
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(1)

    await user.click(within(screen.getByRole('listbox')).getByRole('option'))
    expect(screen.getByRole('combobox', { name: 'Məhsul' })).toHaveValue('Usaq Hoodie (S) (1 əd.)')
  })

  it('selects a scanned barcode on Enter and moves focus to the quantity', async () => {
    const user = userEvent.setup()
    render(<ReceiveStockForm />)

    await user.type(screen.getByRole('combobox', { name: 'Məhsul' }), 'KHZ-DFCT-BLK-S{Enter}')

    expect(screen.getByRole('combobox', { name: 'Məhsul' })).toHaveValue('Şərf (0 əd.)')
    expect(screen.getByRole('spinbutton')).toHaveFocus()
  })

  it('does not submit the form on Enter and keeps looking when nothing matches', async () => {
    const user = userEvent.setup()
    render(<ReceiveStockForm />)

    await user.type(screen.getByRole('combobox', { name: 'Məhsul' }), 'yoxdur{Enter}')

    expect(screen.getByText('Məhsul tapılmadı')).toBeInTheDocument()
    expect(addStock).not.toHaveBeenCalled()
    expect(screen.getByRole('combobox', { name: 'Məhsul' })).toHaveFocus()
  })

  it('picks the highlighted match with the arrow keys and submits the chosen product', async () => {
    const user = userEvent.setup()
    render(<ReceiveStockForm />)

    await user.type(screen.getByRole('combobox', { name: 'Məhsul' }), 'mhs-00{ArrowDown}{Enter}')
    expect(screen.getByRole('combobox', { name: 'Məhsul' })).toHaveValue('Şərf (0 əd.)')

    await user.selectOptions(screen.getByLabelText('Anbar'), 'w1')
    await user.click(screen.getByRole('button', { name: 'Anbara əlavə et' }))

    expect(addStock).toHaveBeenCalledWith({ productId: 'p2', warehouseId: 'w1', quantity: 1 })
  })
})
