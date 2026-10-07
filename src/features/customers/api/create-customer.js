import { addCustomer } from '@/store/customers-store'

export function createCustomer({ name, voen }) {
  return addCustomer({ name, voen })
}
