import { useStoresStore } from '@/store/stores-store'

export function useStores() {
  const { stores } = useStoresStore()

  return {
    stores,
  }
}
