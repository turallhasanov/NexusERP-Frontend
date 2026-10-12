import { apiClient } from '@/services/api-client'
import { addCustomer } from '@/store/customers-store'

// Validation happens on the server; its Azerbaijani message comes back in `error`.
export async function createCustomer({ name, voen, phone, address }) {
  try {
    const customer = await apiClient.post('/customers', { name, voen, phone, address })
    return { ok: true, customer: addCustomer(customer) }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
