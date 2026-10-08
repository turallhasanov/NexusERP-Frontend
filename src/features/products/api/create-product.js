import { addProduct } from '@/store/inventory-store'

export function createProduct({ name, barcode, typeId, unitId, unitPrice, quantity, minQuantity }) {
  return addProduct({ name, barcode, typeId, unitId, unitPrice, quantity, minQuantity })
}
