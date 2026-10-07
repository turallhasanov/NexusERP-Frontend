import { getProduct, receiveStock } from '@/store/inventory-store'
import { getWarehouse } from '@/store/warehouses-store'

export function addStock({ productId, warehouseId, quantity }) {
  const product = getProduct(productId)

  if (!product) {
    return { ok: false, error: 'Məhsul anbarda tapılmadı.' }
  }

  const warehouse = getWarehouse(warehouseId)

  if (!warehouse) {
    return { ok: false, error: 'Depo tapılmadı.' }
  }

  return receiveStock(productId, warehouseId, quantity)
}
