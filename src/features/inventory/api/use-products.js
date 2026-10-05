import { useInventoryStore } from '@/store/inventory-store'

export function useProducts() {
  const { products } = useInventoryStore()

  return {
    products,
    isLoading: false,
  }
}
