import { createApiCollection } from '@/store/create-api-collection'

const stores = createApiCollection({ path: '/stores' })

export const loadStores = stores.load

export function getStore(storeId) {
  return stores.find(storeId)
}

// Adds a row returned by POST /api/stores.
export function addStore(store) {
  return stores.add(store)
}

export function useStoresStore() {
  const { items, isLoading, error, reload } = stores.useCollection()

  return { stores: items, isLoading, error, reload }
}
