import { createApiCollection } from '@/store/create-api-collection'

// GET /api/warehouses returns active warehouses only, each with its stock totals (productCount, totalQuantity).
const warehouses = createApiCollection({ path: '/warehouses' })

export const loadWarehouses = warehouses.load

export function getWarehouse(warehouseId) {
  return warehouses.find(warehouseId)
}

// Adds a row returned by POST /api/warehouses.
export function addWarehouse(warehouse) {
  return warehouses.add(warehouse)
}

// Replaces the row with the one returned by PUT /api/warehouses/{id}.
export function replaceWarehouse(warehouse) {
  return warehouses.upsert(warehouse)
}

export function removeWarehouse(warehouseId) {
  warehouses.remove(warehouseId)
}

export function useWarehousesStore() {
  const { items, isLoading, error, reload } = warehouses.useCollection()

  return { warehouses: items, isLoading, error, reload }
}
