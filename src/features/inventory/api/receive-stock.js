import { getProduct, receiveStock } from '@/store/inventory-store'

export function addStock({ productId, quantity }) {
  const product = getProduct(productId)

  if (!product) {
    return { ok: false, error: 'Məhsul anbarda tapılmadı.' }
  }

  return receiveStock(productId, quantity)
}
