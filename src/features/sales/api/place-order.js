import { PAYMENT_CARD, PAYMENT_CASH } from '@/lib/payment'
import { getCustomer } from '@/store/customers-store'
import { addOrder } from '@/store/orders-store'
import { deductStock, getProduct } from '@/store/inventory-store'
import { getStore } from '@/store/stores-store'
import { getWarehouse } from '@/store/warehouses-store'

export function placeOrder({ type, customerId, storeId, productId, warehouseId, quantity, unitPrice, payment, tendered, change }) {
  if (payment !== PAYMENT_CASH && payment !== PAYMENT_CARD) {
    return { ok: false, error: 'Ödəniş növü tələb olunur.' }
  }

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

  const order = addOrder({
    type: isRetail ? 'retail' : 'wholesale',
    customer: customer?.name ?? 'Pərakəndə',
    voen: customer?.voen ?? '—',
    warehouse: warehouse.name,
    store: store?.name ?? '—',
    product: product.name,
    quantity,
    unitPrice,
    payment,
    tendered,
    change,
  })

  return { ok: true, order }
}
