import { useInventoryStore } from '@/store/inventory-store'
import { getProductType } from '@/store/product-types-store'
import { getProductUnit } from '@/store/product-units-store'

// Inventory product → POS tile / cart source, with the stock of the store's warehouse.
export function toPosItem(product, warehouseId) {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    typeId: product.typeId,
    typeName: getProductType(product.typeId)?.name ?? '—',
    unitId: product.unitId,
    unitName: getProductUnit(product.unitId)?.shortName ?? '',
    unitPrice: product.unitPrice,
    stock: warehouseId ? (product.stocks[warehouseId] ?? 0) : 0,
  }
}

// Active products only: the server rejects inactive ones at checkout.
export function usePosCatalog(warehouseId) {
  const { products, isLoading } = useInventoryStore()

  return {
    catalog: products.filter((product) => product.isActive !== false).map((product) => toPosItem(product, warehouseId)),
    isLoading,
  }
}
