export const PAYMENT_CASH = 'cash'
export const PAYMENT_CARD = 'card'

export function paymentLabel(payment) {
  if (payment === PAYMENT_CASH) {
    return 'Nağd'
  }

  if (payment === PAYMENT_CARD) {
    return 'Kart'
  }

  return '—'
}
