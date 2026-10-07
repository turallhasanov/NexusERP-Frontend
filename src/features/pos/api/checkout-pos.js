import { placeOrder } from '@/features/sales/api/place-order'
import { cashChange, PAYMENT_CARD, PAYMENT_CASH } from '@/lib/payment'

export function checkoutPos({ storeId, lines, payment, tendered }) {
  if (!storeId) {
    return { ok: false, error: 'Mağaza tələb olunur.' }
  }

  if (!lines.length) {
    return { ok: false, error: 'Səbət boşdur.' }
  }

  if (payment !== PAYMENT_CASH && payment !== PAYMENT_CARD) {
    return { ok: false, error: 'Ödəniş növü tələb olunur.' }
  }

  const total = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
  const change = payment === PAYMENT_CASH ? cashChange(total, tendered) : null

  if (payment === PAYMENT_CASH && change == null) {
    return { ok: false, error: 'Verilən məbləğ cəmidən az ola bilməz.' }
  }

  const lastIndex = lines.length - 1

  for (const [index, line] of lines.entries()) {
    const isLast = index === lastIndex
    const result = placeOrder({
      type: 'retail',
      storeId,
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      payment,
      tendered: isLast && payment === PAYMENT_CASH ? tendered : undefined,
      change: isLast && payment === PAYMENT_CASH ? change : undefined,
    })

    if (!result.ok) {
      return result
    }
  }

  return { ok: true, change }
}
