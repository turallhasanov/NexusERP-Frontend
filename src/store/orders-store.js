import { useSyncExternalStore } from 'react'

let nextSequence = 1

let state = {
  orders: [],
}

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getOrdersState() {
  return state
}

export function subscribeOrders(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function addOrder({ customer, product, quantity, unitPrice }) {
  const order = {
    id: String(nextSequence),
    number: `SAT-2026-${String(nextSequence).padStart(3, '0')}`,
    customer,
    product,
    quantity,
    unitPrice,
    total: quantity * unitPrice,
    status: 'open',
  }

  nextSequence += 1
  state = { orders: [order, ...state.orders] }
  emit()
}

export function toggleOrderStatus(orderId) {
  state = {
    orders: state.orders.map((order) =>
      order.id === orderId
        ? { ...order, status: order.status === 'open' ? 'closed' : 'open' }
        : order,
    ),
  }
  emit()
}

export function useOrdersStore() {
  return useSyncExternalStore(subscribeOrders, getOrdersState, getOrdersState)
}
