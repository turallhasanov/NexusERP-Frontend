import { addPurchase } from '@/store/purchases-store'
import { getProduct, receiveStock } from '@/store/inventory-store'
import { getWarehouse } from '@/store/warehouses-store'

export function placePurchase({ productId, warehouseId, quantity, unitPrice }) {
  const product = getProduct(productId)

  if (!product) {
    return { ok: false, error: 'Məhsul anbarda tapılmadı.' }
  }

  const warehouse = getWarehouse(warehouseId)

  if (!warehouse) {
    return { ok: false, error: 'Depo tapılmadı.' }
  }

  const stock = receiveStock(productId, warehouseId, quantity)

  if (!stock.ok) {
    return stock
  }

  addPurchase({
    product: product.name,
    warehouse: warehouse.name,
    quantity,
    unitPrice,
  })

  return { ok: true }
}
