import { useSyncExternalStore } from 'react'

const INITIAL_CUSTOMERS = [
  { id: '1', name: 'Bakı Ofis MMC', code: 'KNT-001', voen: '1401234561' },
  { id: '2', name: 'Gəncə Ticarət', code: 'KNT-002', voen: '1702345672' },
  { id: '3', name: 'Sumqayıt Təchizat', code: 'KNT-003', voen: '1503456783' },
]

let nextSequence = INITIAL_CUSTOMERS.length + 1

let state = {
  customers: INITIAL_CUSTOMERS,
}

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getCustomersState() {
  return state
}

export function subscribeCustomers(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getCustomer(customerId) {
  return state.customers.find((customer) => customer.id === customerId) ?? null
}

export function addCustomer({ name, voen }) {
  const customer = {
    id: String(nextSequence),
    name,
    voen,
    code: `KNT-${String(nextSequence).padStart(3, '0')}`,
  }

  nextSequence += 1
  state = { customers: [customer, ...state.customers] }
  emit()

  return { ok: true }
}

export function useCustomersStore() {
  return useSyncExternalStore(subscribeCustomers, getCustomersState, getCustomersState)
}
