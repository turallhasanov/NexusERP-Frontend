import { useCustomersStore } from '@/store/customers-store'
import { useFinanceStore } from '@/store/finance-store'
import { useHrStore } from '@/store/hr-store'
import { useInventoryStore } from '@/store/inventory-store'
import { useOrdersStore } from '@/store/orders-store'
import { usePurchasesStore } from '@/store/purchases-store'

export function useDashboardSummary() {
  const { orders } = useOrdersStore()
  const { products } = useInventoryStore()
  const { customers } = useCustomersStore()
  const { employees } = useHrStore()
  const { expenses } = useFinanceStore()
  const { purchases } = usePurchasesStore()

  const openOrders = orders.filter((order) => order.status === 'open').length
  const productCount = products.length
  const customerCount = customers.length
  const purchaseCount = purchases.length
  const criticalStock = products.filter(
    (product) => product.quantity <= product.minQuantity,
  ).length
  const revenue = orders.reduce((sum, order) => sum + order.total, 0)
  const purchaseTotal = purchases.reduce((sum, purchase) => sum + purchase.total, 0)
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0) + purchaseTotal
  const balance = revenue - expenseTotal
  const headcount = employees.length
  const onLeave = employees.filter((employee) => employee.status === 'leave').length

  return {
    openOrders,
    productCount,
    customerCount,
    purchaseCount,
    criticalStock,
    revenue,
    expenseTotal,
    balance,
    headcount,
    onLeave,
  }
}
