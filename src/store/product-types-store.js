import { createApiCollection } from '@/store/create-api-collection'

// "Product types" in the UI are the backend's product categories (GET /api/categories → { id, code, name }).
const types = createApiCollection({ path: '/categories' })

export const loadProductTypes = types.load

export function getProductType(typeId) {
  return types.find(typeId)
}

// Adds a row returned by POST /api/categories.
export function addProductType(type) {
  return types.add(type)
}

// Replaces the row with the one returned by PUT /api/categories/{id}.
export function replaceProductType(type) {
  return types.upsert(type)
}

export function removeProductType(typeId) {
  types.remove(typeId)
}

export function useProductTypesStore() {
  const { items, isLoading, error, reload } = types.useCollection()

  return { types: items, isLoading, error, reload }
}
