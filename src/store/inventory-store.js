import { useSyncExternalStore } from 'react'

const INITIAL_PRODUCTS = [
  { id: '1', name: 'A4 surətkağızı', sku: 'STK-001', quantity: 120, minQuantity: 40 },
  { id: '2', name: 'Mürəkkəb kartrici', sku: 'STK-014', quantity: 8, minQuantity: 10 },
  { id: '3', name: 'Bağlama lenti', sku: 'STK-032', quantity: 54, minQuantity: 20 },
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
        ? { ...item, quantity: item.quantity - quantity }
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
  }

  nextSequence += 1
  state = { products: [product, ...state.products] }
  emit()

  return { ok: true }
}

export function receiveStock(productId, quantity) {
  const product = getProduct(productId)

  if (!product) {
    return { ok: false, error: 'Məhsul anbarda tapılmadı.' }
  }

  state = {
    products: state.products.map((item) =>
      item.id === productId
        ? { ...item, quantity: item.quantity + quantity }
        : item,
    ),
  }
  emit()

  return { ok: true }
}

export function useInventoryStore() {
  return useSyncExternalStore(subscribeInventory, getInventoryState, getInventoryState)
}
