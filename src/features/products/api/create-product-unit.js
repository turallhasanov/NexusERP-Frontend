import { apiClient } from '@/services/api-client'
import { addProductUnit } from '@/store/product-units-store'

export async function createProductUnit({ name, shortName }) {
  try {
    const unit = await apiClient.post('/units', { name, shortName })
    return { ok: true, unit: addProductUnit(unit) }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
