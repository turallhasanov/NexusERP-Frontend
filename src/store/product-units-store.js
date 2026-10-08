import { useSyncExternalStore } from 'react'

const INITIAL_UNITS = [
  { id: '1', name: 'ədəd' },
  { id: '2', name: 'kq' },
  { id: '3', name: 'litr' },
]

let nextSequence = INITIAL_UNITS.length + 1

let state = {
  units: INITIAL_UNITS,
}

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getProductUnitsState() {
  return state
}

export function subscribeProductUnits(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getProductUnit(unitId) {
  return state.units.find((unit) => unit.id === unitId) ?? null
}

export function formatQuantity(quantity, unitId) {
  const unit = getProductUnit(unitId)?.name ?? ''
  const shown = String(quantity)

  return unit ? `${shown} ${unit}` : shown
}

export function addProductUnit({ name }) {
  const trimmed = name.trim()

  if (!trimmed) {
    return { ok: false, error: 'Vahid adı tələb olunur.' }
  }

  if (state.units.some((unit) => unit.name.toLowerCase() === trimmed.toLowerCase())) {
    return { ok: false, error: 'Bu vahid artıq var.' }
  }

  const unit = {
    id: String(nextSequence),
    name: trimmed,
  }

  nextSequence += 1
  state = { units: [unit, ...state.units] }
  emit()

  return { ok: true }
}

export function useProductUnitsStore() {
  return useSyncExternalStore(subscribeProductUnits, getProductUnitsState, getProductUnitsState)
}
