import { useSyncExternalStore } from 'react'
import type { User } from '@/types/auth.ts'

type AuthState = {
  user: User | null
}

export const DEMO_USER: User = {
  id: '1',
  name: 'Aysel Məmmədova',
  role: 'admin',
}

let state: AuthState = {
  user: null,
}

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getAuthState() {
  return state
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setAuthUser(user: User | null) {
  state = { user }
  emit()
}

export function useAuthStore() {
  return useSyncExternalStore(subscribeAuth, getAuthState, getAuthState)
}
