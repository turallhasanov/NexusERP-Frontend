import { useProductTypesStore } from '@/store/product-types-store'

export function useProductTypes() {
  const { types, isLoading, error, reload } = useProductTypesStore()

  return { types, isLoading, error, reload }
}
