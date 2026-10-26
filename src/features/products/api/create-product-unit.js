import { apiClient } from '@/services/api-client'
import { addProductUnit, isUnitNameTaken } from '@/store/product-units-store'

export const DUPLICATE_UNIT = 'Bu ölçü vahidi artıq mövcuddur.'

// Known duplicates are refused before the request; the server checks again (409) against the full list.
export async function createProductUnit({ name, shortName }) {
  if (name.trim() && isUnitNameTaken(name)) {
    return { ok: false, error: DUPLICATE_UNIT }
  }

  try {
    const unit = await apiClient.post('/units', { name, shortName })
    return { ok: true, unit: addProductUnit(unit) }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
