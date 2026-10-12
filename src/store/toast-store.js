import { useSyncExternalStore } from 'react'

const TOAST_DURATION_MS = 4000

let state = {
  toasts: [],
}

let nextId = 1

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function getToastState() {
  return state
}

function subscribeToasts(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function dismissToast(id) {
  state = { toasts: state.toasts.filter((toast) => toast.id !== id) }
  emit()
}

// variant: 'success' | 'error'
export function showToast(message, variant = 'success') {
  const toast = { id: nextId, message, variant }

  nextId += 1
  state = { toasts: [...state.toasts, toast] }
  emit()

  setTimeout(() => dismissToast(toast.id), TOAST_DURATION_MS)
}

export function useToastStore() {
  return useSyncExternalStore(subscribeToasts, getToastState, getToastState)
}
