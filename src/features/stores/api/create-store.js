import { apiClient } from '@/services/api-client'
import { addStore } from '@/store/stores-store'

// Validation happens on the server; its Azerbaijani message comes back in `error`.
export async function createStore({ name, warehouseId, address }) {
  try {
    const store = await apiClient.post('/stores', { name, warehouseId, address })
    return { ok: true, store: addStore(store) }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
