import { placeOrder } from '@/features/sales/api/place-order'

export function checkoutPos({ storeId, lines }) {
  if (!storeId) {
    return { ok: false, error: 'Mağaza tələb olunur.' }
  }

  if (!lines.length) {
    return { ok: false, error: 'Səbət boşdur.' }
  }

  for (const line of lines) {
    const result = placeOrder({
      type: 'retail',
      storeId,
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    })

    if (!result.ok) {
      return result
    }
  }

  return { ok: true }
}
