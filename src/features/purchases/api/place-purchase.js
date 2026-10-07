import { getAuthState } from '@/store/auth-store'
import { getCustomer } from '@/store/customers-store'
import { addPurchase } from '@/store/purchases-store'
import { getProduct, receiveStock } from '@/store/inventory-store'
import { getWarehouse } from '@/store/warehouses-store'

export function placePurchase({ customerId, productId, warehouseId, quantity, unitPrice }) {
  const { user } = getAuthState()

  if (!user) {
    return { ok: false, error: 'İstifadəçi tapılmadı.' }
  }

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

  const stock = receiveStock(productId, warehouseId, quantity)

  if (!stock.ok) {
    return stock
  }

  addPurchase({
    customer: customer.name,
    voen: customer.voen,
    product: product.name,
    warehouse: warehouse.name,
    user: user.name,
    quantity,
    unitPrice,
  })

  return { ok: true }
}
