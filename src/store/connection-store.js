import { useSyncExternalStore } from 'react'

// Requests currently waiting to be retried after a network error. While any are pending, the app shows
// "Canlı bağlantı bərpa olunur..." (ConnectionNotice).
let state = {
  pendingRetries: 0,
}

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function getConnectionState() {
  return state
}

function subscribeConnection(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function beginRetry() {
  state = { pendingRetries: state.pendingRetries + 1 }
  emit()
}

export function endRetry() {
  state = { pendingRetries: Math.max(0, state.pendingRetries - 1) }
  emit()
}

export function useConnectionStore() {
  return useSyncExternalStore(subscribeConnection, getConnectionState, getConnectionState)
}
