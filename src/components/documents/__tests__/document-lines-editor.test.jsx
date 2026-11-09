import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { emptyLine } from '@/lib/document-lines'
import { DocumentLinesEditor } from '../DocumentLinesEditor'

vi.mock('@/store/product-units-store', () => ({ formatQuantity: (quantity) => `${quantity} əd.` }))

const products = [
  { id: 'p1', name: 'Yun palto', sku: 'MHS-001', barcode: '2000000000011', unitId: 'u1', quantity: 8, stocks: { w1: 5 }, unitPrice: 40, purchasePrice: 25 },
  { id: 'p2', name: 'Şərf', sku: 'MHS-002', barcode: 'KHZ-DFCT-BLK-S', unitId: 'u1', quantity: 2, stocks: { w1: 2 }, unitPrice: 12, purchasePrice: 7 },
]

function Harness({ onLines }) {
  const [lines, setLines] = useState([emptyLine()])

  return (
    <DocumentLinesEditor
      lines={lines}
      onChange={(next) => {
        onLines(next)
        setLines(next)
      }}
      products={products}
      defaultPrice={(product) => product.unitPrice}
      stockWarehouseId="w1"
    />
  )
}

describe('DocumentLinesEditor product picker', () => {
  it('filters the line product by name, code or barcode and shows the warehouse stock', async () => {
    const user = userEvent.setup()
    render(<Harness onLines={() => {}} />)

    const box = screen.getByRole('combobox', { name: 'Sətir 1: məhsul' })
    await user.click(box)
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(2)

    await user.type(box, 'palt')
    const options = within(screen.getByRole('listbox')).getAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('Yun palto (5 əd.)')
  })

  it('a scanned barcode picks the product, prefills the price and focuses the quantity', async () => {
    const user = userEvent.setup()
    const onLines = vi.fn()
    render(<Harness onLines={onLines} />)

    await user.type(screen.getByRole('combobox', { name: 'Sətir 1: məhsul' }), 'khz-dfct-blk-s{Enter}')

    expect(screen.getByRole('combobox', { name: 'Sətir 1: məhsul' })).toHaveValue('Şərf (2 əd.)')
    expect(screen.getByLabelText('Sətir 1: qiymət')).toHaveValue(12)
    expect(screen.getByLabelText('Sətir 1: miqdar')).toHaveFocus()
    expect(onLines).toHaveBeenLastCalledWith([expect.objectContaining({ productId: 'p2', unitPrice: '12' })])
  })

  it('works on every added line', async () => {
    const user = userEvent.setup()
    render(<Harness onLines={() => {}} />)

    await user.click(screen.getByRole('button', { name: '+ Sətir əlavə et' }))
    await user.type(screen.getByRole('combobox', { name: 'Sətir 2: məhsul' }), 'MHS-001{Enter}')

    expect(screen.getByRole('combobox', { name: 'Sətir 2: məhsul' })).toHaveValue('Yun palto (5 əd.)')
    expect(screen.getByLabelText('Sətir 2: miqdar')).toHaveFocus()
  })
})
