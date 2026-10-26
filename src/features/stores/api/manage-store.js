import { apiClient } from '@/services/api-client'
import { removeStore, replaceStore } from '@/store/stores-store'

function storePath(id) {
  return `/stores/${encodeURIComponent(id)}`
}

// PUT /api/stores/{id}: company admins and IT admins only. Throws with the server's message.
export async function updateStore(id, { name, warehouseId, address }) {
  const store = await apiClient.put(storePath(id), { name, warehouseId, address: address || null })
  return replaceStore(store)
}

// DELETE /api/stores/{id}: company admins and IT admins only; refused (409) while sales, expenses or employees
// still working there point at the store.
export async function deleteStore(id) {
  await apiClient.delete(storePath(id))
  removeStore(id)
}
