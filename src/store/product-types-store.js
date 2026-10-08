import { useSyncExternalStore } from 'react'

const INITIAL_TYPES = [
  { id: '1', name: 'Kağız' },
  { id: '2', name: 'Kartric' },
  { id: '3', name: 'Qablaşdırma' },
]

let nextSequence = INITIAL_TYPES.length + 1

let state = {
  types: INITIAL_TYPES,
}

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getProductTypesState() {
  return state
}

export function subscribeProductTypes(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getProductType(typeId) {
  return state.types.find((type) => type.id === typeId) ?? null
}

export function addProductType({ name }) {
  const trimmed = name.trim()

  if (!trimmed) {
    return { ok: false, error: 'Tip adı tələb olunur.' }
  }

  if (state.types.some((type) => type.name.toLowerCase() === trimmed.toLowerCase())) {
    return { ok: false, error: 'Bu tip artıq var.' }
  }

  const type = {
    id: String(nextSequence),
    name: trimmed,
  }

  nextSequence += 1
  state = { types: [type, ...state.types] }
  emit()

  return { ok: true }
}

export function useProductTypesStore() {
  return useSyncExternalStore(subscribeProductTypes, getProductTypesState, getProductTypesState)
}
