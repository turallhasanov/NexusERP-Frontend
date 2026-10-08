import { formatMonth, monthKey } from '@/lib/date'

export function buildStoreMizan({ orders, purchases, stores, warehouses }) {
  const warehouseNameById = new Map(warehouses.map((warehouse) => [warehouse.id, warehouse.name]))
  const storeByName = new Map(stores.map((store) => [store.name, store]))
  const storeByWarehouseName = new Map()

  for (const store of stores) {
    const warehouseName = warehouseNameById.get(store.warehouseId)

    if (warehouseName) {
      storeByWarehouseName.set(warehouseName, store)
    }
  }

  const buckets = new Map()

  function bucket(store, createdAt) {
    const month = monthKey(createdAt)
    const key = `${store.id}:${month}`

    if (!buckets.has(key)) {
      buckets.set(key, {
        key,
        store: store.name,
        month,
        label: formatMonth(month),
        income: 0,
        expense: 0,
      })
    }

    return buckets.get(key)
  }

  for (const order of orders) {
    if (order.type !== 'retail') {
      continue
    }

    const store = storeByName.get(order.store)

    if (!store) {
      continue
    }

    bucket(store, order.createdAt).income += order.total
  }

  for (const purchase of purchases) {
    const store = storeByWarehouseName.get(purchase.warehouse)

    if (!store) {
      continue
    }

    bucket(store, purchase.createdAt).expense += purchase.total
  }

  return [...buckets.values()]
    .map((row) => ({ ...row, balance: row.income - row.expense }))
    .sort((a, b) => (a.month === b.month ? a.store.localeCompare(b.store, 'az') : a.month < b.month ? 1 : -1))
}
