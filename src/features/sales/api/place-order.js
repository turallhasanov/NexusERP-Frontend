import { getCustomer } from '@/store/customers-store'
import { addOrder } from '@/store/orders-store'
import { deductStock, getProduct } from '@/store/inventory-store'

export function placeOrder({ customerId, productId, quantity, unitPrice }) {
  const customer = getCustomer(customerId)

  if (!customer) {
    return { ok: false, error: 'Kontragent tapılmadı.' }
  }

  const product = getProduct(productId)

  if (!product) {
    return { ok: false, error: 'Məhsul anbarda tapılmadı.' }
  }

  const stock = deductStock(productId, quantity)

  if (!stock.ok) {
    return stock
  }

  addOrder({
    customer: customer.name,
    product: product.name,
    quantity,
    unitPrice,
  })

  return { ok: true }
}
