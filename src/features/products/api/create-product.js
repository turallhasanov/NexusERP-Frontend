import { addProduct } from '@/store/inventory-store'

export function createProduct({ name, barcode, quantity, minQuantity }) {
  return addProduct({ name, barcode, quantity, minQuantity })
}
