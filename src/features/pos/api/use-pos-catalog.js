import { useInventoryStore } from '@/store/inventory-store'

export function usePosCatalog(warehouseId) {
  const { products } = useInventoryStore()

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    unitPrice: product.unitPrice,
    stock: warehouseId ? (product.stocks[warehouseId] ?? 0) : 0,
  }))
}
