import { useMemo } from 'react'
import { createApiCollection } from '@/store/create-api-collection'

// GET /api/units → { id, name, shortName }
const units = createApiCollection({ path: '/units' })

export const loadProductUnits = units.load

// Same rule as the server's unique (company, name) index: case-insensitive, surrounding spaces ignored.
export function unitNameKey(name) {
  return String(name ?? '').trim().toLocaleLowerCase('az')
}

// One entry per id and per name, first one wins. The server refuses duplicates now; this keeps a stale
// cache or rows from before that rule out of dropdowns.
function uniqueUnits(items) {
  const seenIds = new Set()
  const seenNames = new Set()

  return items.filter((unit) => {
    const key = unitNameKey(unit.name)

    if (seenIds.has(unit.id) || seenNames.has(key)) {
      return false
    }

    seenIds.add(unit.id)
    seenNames.add(key)
    return true
  })
}

export function isUnitNameTaken(name) {
  const key = unitNameKey(name)
  return units.getState().items.some((unit) => unitNameKey(unit.name) === key)
}

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
  const unique = useMemo(() => uniqueUnits(items), [items])

  return { units: unique, isLoading, error, reload }
}
