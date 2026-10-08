export const PAYMENT_CASH = 'cash'
export const PAYMENT_CARD = 'card'
export const CASH_NOTES = [1, 5, 10, 20, 50, 100, 200]

export function paymentLabel(payment) {
  if (payment === PAYMENT_CASH) {
    return 'Nağd'
  }

  if (payment === PAYMENT_CARD) {
    return 'Kart'
  }

  return '—'
}

export function cashChange(total, tendered) {
  if (!Number.isFinite(total) || !Number.isFinite(tendered) || tendered < total) {
    return null
  }

  return tendered - total
}
