import { getCustomer } from '@/store/customers-store'
import { addOrder } from '@/store/orders-store'
import { deductStock, getProduct } from '@/store/inventory-store'
import { getStore } from '@/store/stores-store'
import { getWarehouse } from '@/store/warehouses-store'

export function placeOrder({ type, customerId, storeId, productId, warehouseId, quantity, unitPrice }) {
  const isRetail = type === 'retail'
  const store = isRetail ? getStore(storeId) : null

  if (isRetail && !store) {
    return { ok: false, error: 'Mağaza tapılmadı.' }
  }

  const resolvedWarehouseId = isRetail ? store.warehouseId : warehouseId
  const warehouse = getWarehouse(resolvedWarehouseId)

  if (!warehouse) {
    return { ok: false, error: 'Depo tapılmadı.' }
  }

  const customer = customerId ? getCustomer(customerId) : null

  if (!isRetail && !customer) {
    return { ok: false, error: 'Kontragent tapılmadı.' }
  }

  const product = getProduct(productId)

  if (!product) {
    return { ok: false, error: 'Məhsul anbarda tapılmadı.' }
  }

  const stock = deductStock(productId, resolvedWarehouseId, quantity)

  if (!stock.ok) {
    return stock
  }

  addOrder({
    type: isRetail ? 'retail' : 'wholesale',
    customer: customer?.name ?? 'Pərakəndə',
    voen: customer?.voen ?? '—',
    warehouse: warehouse.name,
    store: store?.name ?? '—',
    product: product.name,
    quantity,
    unitPrice,
  })

  return { ok: true }
}
