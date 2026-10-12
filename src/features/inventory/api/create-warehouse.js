import { apiClient } from '@/services/api-client'
import { addWarehouse } from '@/store/warehouses-store'

// Validation happens on the server; its Azerbaijani message comes back in `error`.
export async function createWarehouse({ name, address }) {
  try {
    const warehouse = await apiClient.post('/warehouses', { name, address })
    return { ok: true, warehouse: addWarehouse(warehouse) }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
