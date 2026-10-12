import { SALE_APPROVED, SALE_DRAFT, useOrdersStore } from '@/store/orders-store'

export function useOrders() {
  const { orders, isLoading, error, reload } = useOrdersStore()

  return {
    orders,
    draftOrders: orders.filter((order) => order.status === SALE_DRAFT).length,
    approvedOrders: orders.filter((order) => order.status === SALE_APPROVED).length,
    isLoading,
    error,
    reload,
  }
}
