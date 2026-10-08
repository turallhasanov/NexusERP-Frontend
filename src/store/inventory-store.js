import { useSyncExternalStore } from 'react'
import { getProductType } from '@/store/product-types-store'
import { formatQuantity, getProductUnit } from '@/store/product-units-store'
import { getWarehouse } from '@/store/warehouses-store'

const INITIAL_PRODUCTS = [
  { id: '1', name: 'A4 surətkağızı', sku: 'STK-001', barcode: '2000001000012', typeId: '1', unitId: '1', unitPrice: 9, quantity: 120, minQuantity: 40, stocks: { '1': 120 } },
  { id: '2', name: 'Mürəkkəb kartrici', sku: 'STK-014', barcode: '2000001000142', typeId: '2', unitId: '1', unitPrice: 28, quantity: 8, minQuantity: 10, stocks: { '1': 8 } },
  { id: '3', name: 'Bağlama lenti', sku: 'STK-032', barcode: '2000001000326', typeId: '3', unitId: '1', unitPrice: 4.5, quantity: 54, minQuantity: 20, stocks: { '1': 54 } },
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

export function getProductByBarcode(barcode) {
  const code = barcode.trim()

  if (!code) {
    return null
  }

  return (
    state.products.find(
      (product) => product.barcode === code || product.sku.toLowerCase() === code.toLowerCase(),
    ) ?? null
  )
}

export function deductStock(productId, warehouseId, quantity) {
  const product = getProduct(productId)

  if (!product) {
    return { ok: false, error: 'Məhsul anbarda tapılmadı.' }
  }

  const warehouse = getWarehouse(warehouseId)

  if (!warehouse) {
    return { ok: false, error: 'Depo tapılmadı.' }
  }

  const available = product.stocks[warehouseId] ?? 0

  if (available < quantity) {
    return { ok: false, error: `Bu depoda yalnız ${formatQuantity(available, product.unitId)} var.` }
  }

  state = {
    products: state.products.map((item) =>
      item.id === productId
        ? {
            ...item,
            quantity: item.quantity - quantity,
            stocks: {
              ...item.stocks,
              [warehouseId]: available - quantity,
            },
          }
        : item,
    ),
  }
  emit()

  return { ok: true }
}

export function addProduct({ name, barcode, typeId, unitId, unitPrice, quantity, minQuantity }) {
  const code = barcode.trim()

  if (!code) {
    return { ok: false, error: 'Barkod tələb olunur.' }
  }

  if (!getProductType(typeId)) {
    return { ok: false, error: 'Məhsul tipi tələb olunur.' }
  }

  if (!getProductUnit(unitId)) {
    return { ok: false, error: 'Ölçü vahidi tələb olunur.' }
  }

  if (state.products.some((product) => product.barcode === code)) {
    return { ok: false, error: 'Bu barkod artıq var.' }
  }

  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    return { ok: false, error: 'Qiymət 0-dan böyük olmalıdır.' }
  }

  const product = {
    id: String(nextSequence),
    name,
    sku: `STK-${String(nextSequence).padStart(3, '0')}`,
    barcode: code,
    typeId,
    unitId,
    unitPrice,
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

export function useInventoryStore() {
  return useSyncExternalStore(subscribeInventory, getInventoryState, getInventoryState)
}
