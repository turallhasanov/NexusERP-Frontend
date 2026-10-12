import { apiClient } from '@/services/api-client'
import { addProductType } from '@/store/product-types-store'

// Product types are the backend's categories (POST /api/categories).
export async function createProductType({ name }) {
  try {
    const type = await apiClient.post('/categories', { name })
    return { ok: true, type: addProductType(type) }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
