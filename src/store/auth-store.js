import { useSyncExternalStore } from 'react'

export const DEMO_USER = {
  id: '1',
  name: 'Aysel Məmmədova',
  role: 'admin',
}

let state = {
  user: null,
}

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getAuthState() {
  return state
}

export function subscribeAuth(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setAuthUser(user) {
  state = { user }
  emit()
}

export function useAuthStore() {
  return useSyncExternalStore(subscribeAuth, getAuthState, getAuthState)
}
