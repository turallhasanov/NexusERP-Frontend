import { apiClient } from '@/services/api-client'
import { addProduct } from '@/store/inventory-store'

// Empty number fields go as null: a missing sale price gets the server's "... tələb olunur" message, a missing
// purchase price is stored as 0 until the first approved purchase sets it.
function toPrice(value) {
  return value === '' || value === null || value === undefined ? null : Number(value)
}

// An empty barcode asks the server to generate an in-store EAN-13.
export async function createProduct({ name, barcode, categoryId, unitId, purchasePrice, salePrice }) {
  try {
    const product = await apiClient.post('/products', {
      name,
      barcode,
      categoryId,
      unitId,
      purchasePrice: toPrice(purchasePrice),
      salePrice: toPrice(salePrice),
    })

    return { ok: true, product: addProduct(product) }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
