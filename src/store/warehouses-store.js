import { createApiCollection } from '@/store/create-api-collection'

// GET /api/warehouses returns active warehouses only.
const warehouses = createApiCollection({ path: '/warehouses' })

export const loadWarehouses = warehouses.load

export function getWarehouse(warehouseId) {
  return warehouses.find(warehouseId)
}

// Adds a row returned by POST /api/warehouses.
export function addWarehouse(warehouse) {
  return warehouses.add(warehouse)
}

export function useWarehousesStore() {
  const { items, isLoading, error, reload } = warehouses.useCollection()

  return { warehouses: items, isLoading, error, reload }
}
