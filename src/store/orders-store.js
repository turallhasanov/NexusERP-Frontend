import { fromApiDate } from '@/lib/date'
import { createApiCollection } from '@/store/create-api-collection'
import { getCustomer } from '@/store/customers-store'

export const SALE_DRAFT = 'draft'
export const SALE_APPROVED = 'approved'

// API sale (list summary or full document) → the "order" shape the sales, dashboard and finance modules use.
// A sale without a customer is a walk-in (retail) sale; one with a customer is wholesale.
export function toOrder(sale) {
  const itemCount = sale.items?.length ?? sale.itemCount ?? 0

  return {
    id: sale.id,
    number: sale.documentNumber,
    status: sale.status,
    type: sale.customerId ? 'wholesale' : 'retail',
    customerId: sale.customerId,
    customer: sale.customer?.name ?? 'Pərakəndə',
    // Looked up on read, so it fills in once the customers list has loaded (it is not in the sale).
    get voen() {
      return (sale.customerId && getCustomer(sale.customerId)?.voen) || '—'
    },
    storeId: sale.storeId,
    store: sale.store?.name ?? '—',
    warehouseId: sale.warehouseId,
    warehouse: sale.warehouse?.name ?? '—',
    product: `${itemCount} məhsul`,
    itemCount,
    total: sale.totalAmount,
    createdAt: fromApiDate(sale.documentDate),
  }
}

const orders = createApiCollection({ path: '/sales', fromApi: toOrder })

export const loadOrders = orders.load

export function getOrder(orderId) {
  return orders.find(orderId)
}

// Puts a sale returned by create / approve / POS checkout into the list (replacing it if already there).
export function upsertOrder(sale) {
  return orders.upsert(sale)
}

export function useOrdersStore() {
  const { items, isLoading, error, reload } = orders.useCollection()

  return { orders: items, isLoading, error, reload }
}
