import { useProductTypesStore } from '@/store/product-types-store'

export function useProductTypes() {
  const { types } = useProductTypesStore()

  return { types }
}
