import { useInventoryStore } from '@/store/inventory-store'
import { getProductType } from '@/store/product-types-store'
import { getProductUnit } from '@/store/product-units-store'

export function usePosCatalog(warehouseId) {
  const { products } = useInventoryStore()

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    typeId: product.typeId,
    typeName: getProductType(product.typeId)?.name ?? '—',
    unitId: product.unitId,
    unitName: getProductUnit(product.unitId)?.name ?? '',
    unitPrice: product.unitPrice,
    stock: warehouseId ? (product.stocks[warehouseId] ?? 0) : 0,
  }))
}
