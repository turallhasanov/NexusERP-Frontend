import { getCustomer } from '@/store/customers-store'
import { addOrder } from '@/store/orders-store'
import { deductStock, getProduct } from '@/store/inventory-store'
import { getWarehouse } from '@/store/warehouses-store'

export function placeOrder({ customerId, productId, warehouseId, quantity, unitPrice }) {
  const customer = getCustomer(customerId)

  if (!customer) {
    return { ok: false, error: 'Kontragent tapılmadı.' }
  }

  const product = getProduct(productId)

  if (!product) {
    return { ok: false, error: 'Məhsul anbarda tapılmadı.' }
  }

  const warehouse = getWarehouse(warehouseId)

  if (!warehouse) {
    return { ok: false, error: 'Depo tapılmadı.' }
  }

  const stock = deductStock(productId, warehouseId, quantity)

  if (!stock.ok) {
    return stock
  }

  addOrder({
    customer: customer.name,
    voen: customer.voen,
    product: product.name,
    quantity,
    unitPrice,
  })

  return { ok: true }
}
