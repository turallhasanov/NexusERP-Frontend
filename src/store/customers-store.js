import { createApiCollection } from '@/store/create-api-collection'

const customers = createApiCollection({
  path: '/customers',
  // The server stores a missing VÖEN as null; the UI and dekonts expect a string.
  fromApi: (customer) => ({ ...customer, voen: customer.voen ?? '' }),
})

export const loadCustomers = customers.load

// Looks up any counterparty, deleted ones included: documents that still reference one show its name and VÖEN.
export function getCustomer(customerId) {
  return customers.find(customerId)
}

// After DELETE /api/customers/{id}. A counterparty that documents reference is only deactivated on the server, so it
// stays in the cache (for those documents) with isActive false; one nothing references is removed.
export function markCustomerDeleted(customerId, deactivated) {
  if (deactivated) {
    customers.update(customerId, (customer) => ({ ...customer, isActive: false }))
  } else {
    customers.remove(customerId)
  }
}

// Adds a row returned by POST /api/customers.
export function addCustomer(customer) {
  return customers.add(customer)
}

// The counterparties people can work with: deactivated ones (deleted, but still on documents) are left out.
export function useCustomersStore() {
  const { items, isLoading, error, reload } = customers.useCollection()

  return { customers: items.filter((customer) => customer.isActive !== false), isLoading, error, reload }
}
