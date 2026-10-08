import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'nexuserp-company'

function readStoredCompany() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)

    if (!parsed?.name) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

let state = {
  company: typeof localStorage === 'undefined' ? null : readStoredCompany(),
}

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getCompanyState() {
  return state
}

export function subscribeCompany(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setCompany({ name, voen }) {
  const company = {
    id: '1',
    name,
    voen: voen || '',
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(company))
  state = { company }
  emit()

  return { ok: true }
}

export function useCompanyStore() {
  return useSyncExternalStore(subscribeCompany, getCompanyState, getCompanyState)
}
