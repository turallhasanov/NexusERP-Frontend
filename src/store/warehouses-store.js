import { useSyncExternalStore } from 'react'

const INITIAL_WAREHOUSES = [
  { id: '1', name: 'Mərkəzi anbar', code: 'DPO-001' },
  { id: '2', name: 'Gəncə anbarı', code: 'DPO-002' },
  { id: '3', name: 'Sumqayıt anbarı', code: 'DPO-003' },
]

let nextSequence = INITIAL_WAREHOUSES.length + 1

let state = {
  warehouses: INITIAL_WAREHOUSES,
}

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getWarehousesState() {
  return state
}

export function subscribeWarehouses(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getWarehouse(warehouseId) {
  return state.warehouses.find((warehouse) => warehouse.id === warehouseId) ?? null
}

export function addWarehouse({ name }) {
  const warehouse = {
    id: String(nextSequence),
    name,
    code: `DPO-${String(nextSequence).padStart(3, '0')}`,
  }

  nextSequence += 1
  state = { warehouses: [warehouse, ...state.warehouses] }
  emit()

  return { ok: true }
}

export function useWarehousesStore() {
  return useSyncExternalStore(subscribeWarehouses, getWarehousesState, getWarehousesState)
}
