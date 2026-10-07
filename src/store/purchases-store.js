import { useSyncExternalStore } from 'react'

let nextSequence = 1

let state = {
  purchases: [],
}

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getPurchasesState() {
  return state
}

export function subscribePurchases(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function addPurchase({ product, warehouse, quantity, unitPrice }) {
  const purchase = {
    id: String(nextSequence),
    number: `ALŞ-2026-${String(nextSequence).padStart(3, '0')}`,
    product,
    warehouse,
    quantity,
    unitPrice,
    total: quantity * unitPrice,
  }

  nextSequence += 1
  state = { purchases: [purchase, ...state.purchases] }
  emit()
}

export function usePurchasesStore() {
  return useSyncExternalStore(subscribePurchases, getPurchasesState, getPurchasesState)
}
