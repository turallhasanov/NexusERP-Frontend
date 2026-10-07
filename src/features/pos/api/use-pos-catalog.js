import { useInventoryStore } from '@/store/inventory-store'

const DEMO_PRICES = {
  '1': 9,
  '2': 28,
  '3': 4.5,
}

export function usePosCatalog(warehouseId) {
  const { products } = useInventoryStore()

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    unitPrice: DEMO_PRICES[product.id] ?? 1,
    stock: warehouseId ? (product.stocks[warehouseId] ?? 0) : 0,
  }))
}
