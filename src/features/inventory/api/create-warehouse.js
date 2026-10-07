import { addWarehouse } from '@/store/warehouses-store'

export function createWarehouse({ name }) {
  return addWarehouse({ name })
}
