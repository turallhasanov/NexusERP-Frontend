import { apiClient } from '@/services/api-client'
import { getProduct, getProductByBarcode, loadProducts } from '@/store/inventory-store'

// Scanner lookup: the cached catalog first (instant), then GET /api/products/barcode/{code} for products
// added since the cache was loaded (e.g. on another till). Returns the inventory product, or null.
export async function lookupBarcode(code) {
  const cached = getProductByBarcode(code)

  if (cached) {
    return cached
  }

  try {
    const { product } = await apiClient.get(`/products/barcode/${encodeURIComponent(code)}`)

    // Reload so the new product comes with its stock balances.
    await loadProducts()
    return getProduct(product.id)
  } catch (error) {
    if (error.status === 404) {
      return null
    }

    throw error
  }
}
