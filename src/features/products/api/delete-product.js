import { apiClient } from '@/services/api-client'
import { removeProduct } from '@/store/inventory-store'

// DELETE /api/products/{id}: company admins and IT admins only; refused (409) while a warehouse holds stock.
// A product that purchases or sales reference is deactivated instead: `deactivated` is true and `message`
// says so.
export async function deleteProduct(id) {
  try {
    const { deactivated, message } = await apiClient.delete(`/products/${encodeURIComponent(id)}`)
    removeProduct(id)
    return { ok: true, deactivated, message }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
