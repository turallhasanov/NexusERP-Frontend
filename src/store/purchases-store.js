import { fromApiDate } from '@/lib/date'
import { createApiCollection } from '@/store/create-api-collection'
import { getCustomer } from '@/store/customers-store'

export const PURCHASE_DRAFT = 'draft'
export const PURCHASE_APPROVED = 'approved'

// API purchase (list summary or full document) → the shape the purchases, dashboard and finance modules use.
export function toPurchase(purchase) {
  const itemCount = purchase.items?.length ?? purchase.itemCount ?? 0

  return {
    id: purchase.id,
    number: purchase.documentNumber,
    status: purchase.status,
    customerId: purchase.customerId,
    customer: purchase.customer?.name ?? '—',
    // Looked up on read, so it fills in once the customers list has loaded (it is not in the purchase).
    get voen() {
      return getCustomer(purchase.customerId)?.voen || '—'
    },
    warehouseId: purchase.warehouseId,
    warehouse: purchase.warehouse?.name ?? '—',
    product: `${itemCount} məhsul`,
    itemCount,
    total: purchase.totalAmount,
    createdAt: fromApiDate(purchase.documentDate),
  }
}

const purchases = createApiCollection({ path: '/purchases', fromApi: toPurchase })

export const loadPurchases = purchases.load

export function getPurchase(purchaseId) {
  return purchases.find(purchaseId)
}

// Puts a purchase returned by create / approve into the list (replacing it if already there).
export function upsertPurchase(purchase) {
  return purchases.upsert(purchase)
}

export function usePurchasesStore() {
  const { items, isLoading, error, reload } = purchases.useCollection()

  return { purchases: items, isLoading, error, reload }
}
