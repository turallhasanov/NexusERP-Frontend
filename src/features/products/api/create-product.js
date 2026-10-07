import { addProduct } from '@/store/inventory-store'

export function createProduct({ name, barcode, unitPrice, quantity, minQuantity }) {
  return addProduct({ name, barcode, unitPrice, quantity, minQuantity })
}
