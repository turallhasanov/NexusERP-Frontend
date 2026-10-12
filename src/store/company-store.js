import { useSyncExternalStore } from 'react'

// Cached details ({ id, name, voen }) of the active company, for the sidebar and dekonts.
// The source of truth is GET /api/company; this copy only survives page reloads.
const STORAGE_KEY = 'nexuserp-company'

function readStoredCompany() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)

    if (!parsed?.id || !parsed?.name) {
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

export function setCompany({ id, name, voen }) {
  const company = {
    id,
    name,
    voen: voen || '',
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(company))
  state = { company }
  emit()
}

export function clearCompany() {
  localStorage.removeItem(STORAGE_KEY)
  state = { company: null }
  emit()
}

export function useCompanyStore() {
  return useSyncExternalStore(subscribeCompany, getCompanyState, getCompanyState)
}
