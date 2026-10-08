import { useProductUnitsStore } from '@/store/product-units-store'

export function useProductUnits() {
  const { units } = useProductUnitsStore()

  return { units }
}
