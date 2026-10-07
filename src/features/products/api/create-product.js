import { addProduct } from '@/store/inventory-store'

export function createProduct({ name, quantity, minQuantity }) {
  return addProduct({ name, quantity, minQuantity })
}
