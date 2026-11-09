import { splitPhotos } from '@/features/products/lib/product-images'
import { formatProductName } from '@/lib/product-name'
import { apiClient } from '@/services/api-client'
import { addProduct } from '@/store/inventory-store'

// Empty number fields go as null: a missing sale price gets the server's "... tələb olunur" message, a missing
// purchase price is stored as 0 until the first approved purchase sets it.
function toPrice(value) {
  return value === '' || value === null || value === undefined ? null : Number(value)
}

// The fields travel as multipart/form-data so the photo can go with them; empty values are left out.
function toFormData({ name, color, size, barcode, categoryId, unitId, purchasePrice, salePrice, showOnWebsite, images = [] }) {
  const body = new FormData()
  const append = (key, value) => {
    if (value !== null && value !== undefined && value !== '') {
      body.append(key, value)
    }
  }

  // With a color and/or size the name is "Name (Color / Size)"; that is the name saved here and sent to Khazar.
  append('name', formatProductName(name, color, size))
  append('barcode', barcode)
  append('categoryId', categoryId)
  append('unitId', unitId)
  append('purchasePrice', toPrice(purchasePrice))
  append('salePrice', toPrice(salePrice))
  body.append('showOnWebsite', showOnWebsite ? 'true' : 'false')

  // The first photo is the main one; the others go to the Khazar store gallery.
  const { image, gallery } = splitPhotos(images)

  if (image) {
    body.append('image', image)
  }

  for (const file of gallery) {
    body.append('galleryImages', file)
  }

  return body
}

// POST /api/products. `color` and `size` are optional and become part of the name. An empty barcode asks the server to generate an in-store EAN-13. With `showOnWebsite` the server
// also sends the product (and photo) to the Khazar store; `storefront` says how that went:
// { status: 'synced' | 'failed' | 'notShown', message }. A failed push does not undo the save.
export async function createProduct(fields) {
  try {
    const created = await apiClient.post('/products', toFormData(fields))

    return { ok: true, product: addProduct(created), storefront: created.storefront ?? { status: 'notShown' } }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
