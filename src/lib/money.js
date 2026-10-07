export function formatAzn(amount) {
  return `${amount.toLocaleString('az-AZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₼`
}
