import { apiClient } from '@/services/api-client'

// GET /api/products?q=&categoryId= — server-side search over name, code and barcode.
// Returns the raw API products; the page joins them with the inventory cache for stock.
export async function searchProducts({ q, categoryId }) {
  const params = {}

  if (q.trim()) {
    params.q = q.trim()
  }

  if (categoryId) {
    params.categoryId = categoryId
  }

  const { items } = await apiClient.get('/products', { params })
  return items
}
