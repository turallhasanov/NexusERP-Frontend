import { useProductUnitsStore } from '@/store/product-units-store'

export function useProductUnits() {
  const { units, isLoading, error, reload } = useProductUnitsStore()

  return { units, isLoading, error, reload }
}
