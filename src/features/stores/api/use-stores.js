import { useStoresStore } from '@/store/stores-store'

export function useStores() {
  const { stores, isLoading, error, reload } = useStoresStore()

  return { stores, isLoading, error, reload }
}
