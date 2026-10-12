import { createApiCollection } from '@/store/create-api-collection'

// GET /api/units → { id, name, shortName }
const units = createApiCollection({ path: '/units' })

export const loadProductUnits = units.load

export function getProductUnit(unitId) {
  return units.find(unitId)
}

export function formatQuantity(quantity, unitId) {
  const unit = getProductUnit(unitId)
  const label = unit?.shortName || unit?.name || ''
  const shown = String(quantity)

  return label ? `${shown} ${label}` : shown
}

// Adds a row returned by POST /api/units.
export function addProductUnit(unit) {
  return units.add(unit)
}

export function useProductUnitsStore() {
  const { items, isLoading, error, reload } = units.useCollection()

  return { units: items, isLoading, error, reload }
}
