import { apiClient } from '@/services/api-client'
import { createApiCollection } from '@/store/create-api-collection'
import { formatQuantity } from '@/store/product-units-store'
import { getWarehouse } from '@/store/warehouses-store'

// Same default as the backend dashboard's low-stock threshold; products have no per-item minimum yet.
export const DEFAULT_MIN_QUANTITY = 5

// API product → the shape the modules use. `sku` is the server's product code (MHS-001), `typeId` its
// category and `unitPrice` the sale price. Stock per warehouse comes from GET /api/inventory/stocks.
export function toProduct(product, stockRows = []) {
  const stocks = {}

  for (const row of stockRows) {
    stocks[row.warehouseId] = row.quantity
  }

  return {
    id: product.id,
    name: product.name,
    sku: product.code,
    barcode: product.barcode,
    typeId: product.categoryId,
    unitId: product.unitId,
    unitPrice: product.salePrice,
    purchasePrice: product.purchasePrice,
    isActive: product.isActive,
    minQuantity: DEFAULT_MIN_QUANTITY,
    quantity: Object.values(stocks).reduce((sum, quantity) => sum + quantity, 0),
    stocks,
  }
}

async function fetchProductsWithStock() {
  const [{ items: products }, { items: stockRows }] = await Promise.all([
    apiClient.get('/products'),
    apiClient.get('/inventory/stocks'),
  ])

  const rowsByProduct = new Map()

  for (const row of stockRows) {
    rowsByProduct.set(row.productId, [...(rowsByProduct.get(row.productId) ?? []), row])
  }

  return products.map((product) => ({ product, stockRows: rowsByProduct.get(product.id) ?? [] }))
}

const inventory = createApiCollection({
  fetchItems: fetchProductsWithStock,
  // Loaded rows arrive as { product, stockRows }; rows added after POST /api/products are bare products.
  fromApi: (row) => (row.product ? toProduct(row.product, row.stockRows) : toProduct(row)),
})

export const loadProducts = inventory.load

export function getProduct(productId) {
  return inventory.find(productId)
}

export function getProductByBarcode(barcode) {
  const code = barcode.trim()

  if (!code) {
    return null
  }

  return (
    inventory.getState().items.find(
      (product) => product.barcode === code || product.sku.toLowerCase() === code.toLowerCase(),
    ) ?? null
  )
}

// Adds a product returned by POST /api/products; a new product has no stock yet.
export function addProduct(product) {
  return inventory.add(product)
}

// After DELETE /api/products/{id}: the product leaves the catalog whether it was removed or deactivated.
export function removeProduct(productId) {
  inventory.remove(productId)
}

// deductStock and receiveStock change the cached stock only. Purchases, sales and POS still run in the
// browser; they move to the API (and server-side stock) in their own commits.
export function deductStock(productId, warehouseId, quantity) {
  const product = getProduct(productId)

  if (!product) {
    return { ok: false, error: 'Məhsul anbarda tapılmadı.' }
  }

  if (!getWarehouse(warehouseId)) {
    return { ok: false, error: 'Anbar tapılmadı.' }
  }

  const available = product.stocks[warehouseId] ?? 0

  if (available < quantity) {
    return { ok: false, error: `Bu anbarda yalnız ${formatQuantity(available, product.unitId)} var.` }
  }

  inventory.update(productId, (item) => ({
    ...item,
    quantity: item.quantity - quantity,
    stocks: { ...item.stocks, [warehouseId]: available - quantity },
  }))

  return { ok: true }
}

export function receiveStock(productId, warehouseId, quantity) {
  if (!getProduct(productId)) {
    return { ok: false, error: 'Məhsul anbarda tapılmadı.' }
  }

  if (!getWarehouse(warehouseId)) {
    return { ok: false, error: 'Anbar tapılmadı.' }
  }

  inventory.update(productId, (item) => ({
    ...item,
    quantity: item.quantity + quantity,
    stocks: { ...item.stocks, [warehouseId]: (item.stocks[warehouseId] ?? 0) + quantity },
  }))

  return { ok: true }
}

export function useInventoryStore() {
  const { items, isLoading, error, reload } = inventory.useCollection()

  return { products: items, isLoading, error, reload }
}
