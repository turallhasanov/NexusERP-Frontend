import { placeOrder } from '@/features/sales/api/place-order'
import { PAYMENT_CARD, PAYMENT_CASH } from '@/lib/payment'

export function checkoutPos({ storeId, lines, payment }) {
  if (!storeId) {
    return { ok: false, error: 'Mağaza tələb olunur.' }
  }

  if (!lines.length) {
    return { ok: false, error: 'Səbət boşdur.' }
  }

  if (payment !== PAYMENT_CASH && payment !== PAYMENT_CARD) {
    return { ok: false, error: 'Ödəniş növü tələb olunur.' }
  }

  for (const line of lines) {
    const result = placeOrder({
      type: 'retail',
      storeId,
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      payment,
    })

    if (!result.ok) {
      return result
    }
  }

  return { ok: true }
}
