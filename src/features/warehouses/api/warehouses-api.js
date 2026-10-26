import { apiClient } from '@/services/api-client'
import { addWarehouse, removeWarehouse, replaceWarehouse } from '@/store/warehouses-store'

// Empty optional fields go as null; the server trims and validates, and its Azerbaijani message is thrown as is.
function toRequest({ name, address, responsiblePerson, capacity }) {
  return {
    name,
    address: address || null,
    responsiblePerson: responsiblePerson || null,
    capacity: capacity === '' || capacity === null || capacity === undefined ? null : Number(capacity),
  }
}

// POST /api/warehouses: company admins and IT admins only.
export async function createWarehouse(form) {
  const warehouse = await apiClient.post('/warehouses', toRequest(form))
  return addWarehouse(warehouse)
}

// PUT /api/warehouses/{id}: company admins and IT admins only.
export async function updateWarehouse(id, form) {
  const warehouse = await apiClient.put(`/warehouses/${encodeURIComponent(id)}`, toRequest(form))
  return replaceWarehouse(warehouse)
}

// DELETE /api/warehouses/{id}: company admins and IT admins only; refused (409) while it holds stock,
// supplies a store or has draft documents.
export async function deleteWarehouse(id) {
  await apiClient.delete(`/warehouses/${encodeURIComponent(id)}`)
  removeWarehouse(id)
}

// GET /api/warehouses/{id} → { warehouse, stocks, movements }. Takes `{ id }` for useApiQuery.
export function fetchWarehouseDetails({ id }) {
  return apiClient.get(`/warehouses/${encodeURIComponent(id)}`)
}
