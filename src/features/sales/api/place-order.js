import { addOrder } from '@/store/orders-store'
import { deductStock, getProduct } from '@/store/inventory-store'

export function placeOrder({ customer, productId, quantity, unitPrice }) {
  const product = getProduct(productId)

  if (!product) {
    return { ok: false, error: 'Məhsul anbarda tapılmadı.' }
  }

  const stock = deductStock(productId, quantity)

  if (!stock.ok) {
    return stock
  }

  addOrder({
    customer,
    product: product.name,
    quantity,
    unitPrice,
  })

  return { ok: true }
}
