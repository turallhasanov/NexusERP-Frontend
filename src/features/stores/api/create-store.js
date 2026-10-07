import { addStore } from '@/store/stores-store'

export function createStore({ name, warehouseId }) {
  return addStore({ name, warehouseId })
}
