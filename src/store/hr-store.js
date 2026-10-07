import { useSyncExternalStore } from 'react'

const INITIAL_EMPLOYEES = [
  { id: '1', name: 'Aysel Məmmədova', title: 'Administrator', department: 'İdarə', status: 'active' },
  { id: '2', name: 'Elvin Quliyev', title: 'Anbardar', department: 'Anbar', status: 'active' },
  { id: '3', name: 'Nigar Əliyeva', title: 'Satıcı', department: 'Satış', status: 'leave' },
]

let nextSequence = INITIAL_EMPLOYEES.length + 1

let state = {
  employees: INITIAL_EMPLOYEES,
}

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getHrState() {
  return state
}

export function subscribeHr(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function addEmployee({ name, title, department }) {
  const employee = {
    id: String(nextSequence),
    name,
    title,
    department,
    status: 'active',
  }

  nextSequence += 1
  state = { employees: [employee, ...state.employees] }
  emit()
}

export function useHrStore() {
  return useSyncExternalStore(subscribeHr, getHrState, getHrState)
}
