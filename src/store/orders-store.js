import { fromApiDate } from '@/lib/date'
import { createApiCollection } from '@/store/create-api-collection'
import { getCustomer } from '@/store/customers-store'

export const SALE_DRAFT = 'draft'
export const SALE_APPROVED = 'approved'

// Where a sale came from (the API's `channel`): entered here (sales form or POS), or a Khazar online order.
export const CHANNEL_DIRECT = 'direct'
export const CHANNEL_ONLINE = 'online'

// API sale (list summary or full document) → the "order" shape the sales, dashboard and finance modules use.
// A sale without a customer is a walk-in (retail) sale; one with a customer is wholesale. A Khazar online order is
// retail too, although it is booked to the "Khazar Online Müştəri" account: its end customer is `retailCustomer`.
export function toOrder(sale) {
  const itemCount = sale.items?.length ?? sale.itemCount ?? 0
  const isOnline = sale.channel === CHANNEL_ONLINE

  return {
    id: sale.id,
    number: sale.documentNumber,
    status: sale.status,
    channel: isOnline ? CHANNEL_ONLINE : CHANNEL_DIRECT,
    type: isOnline || !sale.customerId ? 'retail' : 'wholesale',
    externalOrderNumber: sale.externalOrderNumber ?? null,
    // { name, phone, email, address } of the online shopper; null for other sales.
    retailCustomer: sale.retailCustomer ?? null,
    customerId: sale.customerId,
    customer: (isOnline ? sale.retailCustomer?.name : null) ?? sale.customer?.name ?? 'Pərakəndə',
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
