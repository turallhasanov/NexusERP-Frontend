import { apiClient } from '@/services/api-client'
import { removeProductType, replaceProductType } from '@/store/product-types-store'

// PUT /api/categories/{id}: company admins and IT admins only.
export async function updateProductType(id, { name }) {
  try {
    const type = await apiClient.put(`/categories/${encodeURIComponent(id)}`, { name })
    return { ok: true, type: replaceProductType(type) }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

// DELETE /api/categories/{id}: company admins and IT admins only; refused (409) while products use it.
export async function deleteProductType(id) {
  try {
    await apiClient.delete(`/categories/${encodeURIComponent(id)}`)
    removeProductType(id)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
