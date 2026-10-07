import { useSyncExternalStore } from 'react'
import { getWarehouse } from '@/store/warehouses-store'

const INITIAL_STORES = [
  { id: '1', name: 'Bakı mağazası', code: 'MGZ-001', warehouseId: '1' },
  { id: '2', name: 'Gəncə mağazası', code: 'MGZ-002', warehouseId: '2' },
]

let nextSequence = INITIAL_STORES.length + 1

let state = {
  stores: INITIAL_STORES,
}

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getStoresState() {
  return state
}

export function subscribeStores(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getStore(storeId) {
  return state.stores.find((store) => store.id === storeId) ?? null
}

export function addStore({ name, warehouseId }) {
  const warehouse = getWarehouse(warehouseId)

  if (!warehouse) {
    return { ok: false, error: 'Depo tapılmadı.' }
  }

  const store = {
    id: String(nextSequence),
    name,
    code: `MGZ-${String(nextSequence).padStart(3, '0')}`,
    warehouseId,
  }

  nextSequence += 1
  state = { stores: [store, ...state.stores] }
  emit()

  return { ok: true }
}

export function useStoresStore() {
  return useSyncExternalStore(subscribeStores, getStoresState, getStoresState)
}
