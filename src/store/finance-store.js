import { useSyncExternalStore } from 'react'

let nextSequence = 1

let state = {
  expenses: [],
}

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getFinanceState() {
  return state
}

export function subscribeFinance(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function addExpense({ category, amount }) {
  const expense = {
    id: String(nextSequence),
    number: `MƏX-2026-${String(nextSequence).padStart(3, '0')}`,
    category,
    amount,
    createdAt: new Date().toISOString(),
  }

  nextSequence += 1
  state = { expenses: [expense, ...state.expenses] }
  emit()
}

export function useFinanceStore() {
  return useSyncExternalStore(subscribeFinance, getFinanceState, getFinanceState)
}
