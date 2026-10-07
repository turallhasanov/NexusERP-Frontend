import { addCustomer } from '@/store/customers-store'

export function createCustomer({ name }) {
  return addCustomer({ name })
}
