import { API_BASE_URL } from '@/services/api-client'

// Origin of this system's API (http://localhost:5264): its photos are stored as site paths like /uploads/products/x.png.
const API_ORIGIN = new URL(API_BASE_URL, window.location.origin).origin

// Address a product photo can be loaded from. Photos imported from Khazar are already full addresses on the Khazar API;
// photos saved here are site paths on this API. Empty when the product has none.
export function productImageSrc(imageUrl) {
  if (!imageUrl) {
    return ''
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  // Site paths come with or without the leading slash (/uploads/products/x.png, images/x.jpg).
  return `${API_ORIGIN}/${imageUrl.replace(/^\/+/, '')}`
}
