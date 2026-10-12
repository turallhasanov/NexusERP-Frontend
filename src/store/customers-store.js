import { createApiCollection } from '@/store/create-api-collection'

const customers = createApiCollection({
  path: '/customers',
  // The server stores a missing VÖEN as null; the UI and dekonts expect a string.
  fromApi: (customer) => ({ ...customer, voen: customer.voen ?? '' }),
})

export const loadCustomers = customers.load

export function getCustomer(customerId) {
  return customers.find(customerId)
}

// Adds a row returned by POST /api/customers.
export function addCustomer(customer) {
  return customers.add(customer)
}

export function useCustomersStore() {
  const { items, isLoading, error, reload } = customers.useCollection()

  return { customers: items, isLoading, error, reload }
}
