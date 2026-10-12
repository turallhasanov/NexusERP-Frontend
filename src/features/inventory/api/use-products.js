import { useInventoryStore } from '@/store/inventory-store'

export function useProducts() {
  const { products, isLoading, error, reload } = useInventoryStore()

  return {
    products,
    criticalStock: products.filter(
      (product) => product.quantity <= product.minQuantity,
    ).length,
    isLoading,
    error,
    reload,
  }
}
