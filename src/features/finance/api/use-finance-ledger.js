import { useOrdersStore } from '@/store/orders-store'

export function useFinanceLedger() {
  const { orders } = useOrdersStore()
  const income = orders.reduce((sum, order) => sum + order.total, 0)

  return {
    entries: orders,
    income,
  }
}
