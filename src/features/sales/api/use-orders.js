import { useOrdersStore } from '@/store/orders-store'

export function useOrders() {
  const { orders } = useOrdersStore()

  return {
    orders,
    openOrders: orders.filter((order) => order.status === 'open').length,
  }
}
