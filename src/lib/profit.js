// Profit → green, loss → red, zero → neutral (StatCard tones).
export function profitTone(amount) {
  if (amount > 0) {
    return 'positive'
  }

  return amount < 0 ? 'negative' : 'default'
}
