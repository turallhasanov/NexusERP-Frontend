// Stock quantities mix units (pcs, kg, l), so totals are shown as plain numbers with up to 3 decimals.
export function formatQuantityValue(value) {
  return Number(value ?? 0).toLocaleString('az-AZ', { maximumFractionDigits: 3 })
}

// Share of the planned capacity in use; '—' when no capacity is set.
export function occupancyLabel(warehouse) {
  if (!warehouse.capacity) {
    return '—'
  }

  const percent = (Number(warehouse.totalQuantity) / Number(warehouse.capacity)) * 100
  return `${Math.round(percent)}%`
}
