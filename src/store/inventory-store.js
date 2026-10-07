import { useSyncExternalStore } from 'react'
import { getWarehouse } from '@/store/warehouses-store'

const INITIAL_PRODUCTS = [
  { id: '1', name: 'A4 surətkağızı', sku: 'STK-001', quantity: 120, minQuantity: 40, stocks: { '1': 120 } },
  { id: '2', name: 'Mürəkkəb kartrici', sku: 'STK-014', quantity: 8, minQuantity: 10, stocks: { '1': 8 } },
  { id: '3', name: 'Bağlama lenti', sku: 'STK-032', quantity: 54, minQuantity: 20, stocks: { '1': 54 } },
]

let nextSequence = INITIAL_PRODUCTS.length + 1

let state = {
  products: INITIAL_PRODUCTS,
}

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getInventoryState() {
  return state
}

export function subscribeInventory(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getProduct(productId) {
  return state.products.find((product) => product.id === productId) ?? null
}

export function deductStock(productId, quantity) {
  const product = getProduct(productId)

  if (!product) {
    return { ok: false, error: 'Məhsul anbarda tapılmadı.' }
  }

  if (product.quantity < quantity) {
    return { ok: false, error: `Anbarda yalnız ${product.quantity} ədəd var.` }
  }

  state = {
    products: state.products.map((item) =>
      item.id === productId
        ? { ...item, quantity: item.quantity - quantity, stocks: takeFromStocks(item.stocks, quantity) }
        : item,
    ),
  }
  emit()

  return { ok: true }
}

export function addProduct({ name, quantity, minQuantity }) {
  const product = {
    id: String(nextSequence),
    name,
    sku: `STK-${String(nextSequence).padStart(3, '0')}`,
    quantity,
    minQuantity,
    stocks: { '1': quantity },
  }

  nextSequence += 1
  state = { products: [product, ...state.products] }
  emit()

  return { ok: true }
}

export function receiveStock(productId, warehouseId, quantity) {
  const product = getProduct(productId)

  if (!product) {
    return { ok: false, error: 'Məhsul anbarda tapılmadı.' }
  }

  const warehouse = getWarehouse(warehouseId)

  if (!warehouse) {
    return { ok: false, error: 'Depo tapılmadı.' }
  }

  state = {
    products: state.products.map((item) =>
      item.id === productId
        ? {
            ...item,
            quantity: item.quantity + quantity,
            stocks: {
              ...item.stocks,
              [warehouseId]: (item.stocks[warehouseId] ?? 0) + quantity,
            },
          }
        : item,
    ),
  }
  emit()

  return { ok: true }
}

function takeFromStocks(stocks, quantity) {
  const next = { ...stocks }
  let remaining = quantity

  for (const warehouseId of Object.keys(next)) {
    if (remaining === 0) {
      break
    }

    const available = next[warehouseId]
    const take = available > remaining ? remaining : available
    next[warehouseId] = available - take
    remaining -= take
  }

  return next
}

export function useInventoryStore() {
  return useSyncExternalStore(subscribeInventory, getInventoryState, getInventoryState)
}
