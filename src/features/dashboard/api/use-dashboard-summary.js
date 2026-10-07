import { useFinanceStore } from '@/store/finance-store'
import { useHrStore } from '@/store/hr-store'
import { useInventoryStore } from '@/store/inventory-store'
import { useOrdersStore } from '@/store/orders-store'

export function useDashboardSummary() {
  const { orders } = useOrdersStore()
  const { products } = useInventoryStore()
  const { employees } = useHrStore()
  const { expenses } = useFinanceStore()

  const openOrders = orders.length
  const criticalStock = products.filter(
    (product) => product.quantity <= product.minQuantity,
  ).length
  const revenue = orders.reduce((sum, order) => sum + order.total, 0)
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const headcount = employees.length
  const onLeave = employees.filter((employee) => employee.status === 'leave').length

  return {
    openOrders,
    criticalStock,
    revenue,
    expenseTotal,
    headcount,
    onLeave,
  }
}
