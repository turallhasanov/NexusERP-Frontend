import { formatProductName } from '@/lib/product-name'
import { apiClient } from '@/services/api-client'
import { loadProducts } from '@/store/inventory-store'

function toPrice(value) {
  return value === '' || value === null || value === undefined ? null : Number(value)
}

// PUT /api/products/{id} as multipart/form-data (the fields plus an optional new photo). The barcode cannot change.
// `removeImage` drops the photo when no new one is sent. The server also updates the Khazar store when the product is, or
// just was, shown there; `storefront` says how that went: { status: 'synced' | 'hidden' | 'failed' | 'notShown', message }.
// A failed push does not undo the save.
export async function updateProduct(
  id,
  { name, color, size, categoryId, unitId, purchasePrice, salePrice, showOnWebsite, image, removeImage },
) {
  const body = new FormData()
  const append = (key, value) => {
    if (value !== null && value !== undefined && value !== '') {
      body.append(key, value)
    }
  }

  // With a color and/or size the name is "Name (Color / Size)"; `name` here is the base name without that suffix.
  append('name', formatProductName(name, color, size))
  append('categoryId', categoryId)
  append('unitId', unitId)
  append('purchasePrice', toPrice(purchasePrice))
  append('salePrice', toPrice(salePrice))
  body.append('showOnWebsite', showOnWebsite ? 'true' : 'false')
  body.append('removeImage', removeImage ? 'true' : 'false')

  if (image) {
    body.append('image', image)
  }

  try {
    const updated = await apiClient.put(`/products/${encodeURIComponent(id)}`, body)

    // The cached rows carry stock and the photo address; reload them so the table shows the saved product.
    void loadProducts()
    return { ok: true, product: updated, storefront: updated.storefront ?? { status: 'notShown' } }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
