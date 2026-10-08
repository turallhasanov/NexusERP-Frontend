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

export function addOrder({ type, customer, voen, warehouse, store, product, quantity, unitPrice, payment, tendered, change }) {
  const order = {
    id: String(nextSequence),
    number: `SAT-2026-${String(nextSequence).padStart(3, '0')}`,
    type,
    customer,
    voen,
    warehouse,
    store,
    product,
    quantity,
    unitPrice,
    payment: payment ?? '—',
    tendered: Number.isFinite(tendered) ? tendered : null,
    change: Number.isFinite(change) ? change : null,
    total: quantity * unitPrice,
    status: 'open',
    createdAt: new Date().toISOString(),
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
