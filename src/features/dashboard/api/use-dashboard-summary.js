import { useInventoryStore } from '@/store/inventory-store'
import { useOrdersStore } from '@/store/orders-store'

export function useDashboardSummary() {
  const { orders } = useOrdersStore()
  const { products } = useInventoryStore()

  const openOrders = orders.length
  const criticalStock = products.filter(
    (product) => product.quantity <= product.minQuantity,
  ).length
  const revenue = orders.reduce((sum, order) => sum + order.total, 0)

  return {
    openOrders,
    criticalStock,
    revenue,
  }
}
