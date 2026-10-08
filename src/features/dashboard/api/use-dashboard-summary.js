import { payrollForPeriod } from '@/features/hr/api/payroll'
import { isInPeriod, PERIOD_MONTH } from '@/lib/date'
import { useCustomersStore } from '@/store/customers-store'
import { useFinanceStore } from '@/store/finance-store'
import { useHrStore } from '@/store/hr-store'
import { useInventoryStore } from '@/store/inventory-store'
import { useOrdersStore } from '@/store/orders-store'
import { usePurchasesStore } from '@/store/purchases-store'
import { useStoresStore } from '@/store/stores-store'

export function useDashboardSummary(period = PERIOD_MONTH) {
  const { orders } = useOrdersStore()
  const { products } = useInventoryStore()
  const { customers } = useCustomersStore()
  const { stores } = useStoresStore()
  const { employees } = useHrStore()
  const { expenses } = useFinanceStore()
  const { purchases } = usePurchasesStore()
  const periodOrders = orders.filter((order) => isInPeriod(order.createdAt, period))
  const periodPurchases = purchases.filter((purchase) => isInPeriod(purchase.createdAt, period))
  const periodExpenses = expenses.filter((expense) => isInPeriod(expense.createdAt, period))
  const wholesaleOpen = orders.filter(
    (order) => order.type === 'wholesale' && order.status === 'open',
  ).length
  const retailOpen = orders.filter((order) => order.type === 'retail' && order.status === 'open').length
  const roster = employees.filter((employee) => employee.status !== 'left')
  const wholesaleRevenue = periodOrders
    .filter((order) => order.type === 'wholesale')
    .reduce((sum, order) => sum + order.total, 0)
  const retailRevenue = periodOrders
    .filter((order) => order.type === 'retail')
    .reduce((sum, order) => sum + order.total, 0)
  const expenseTotal =
    periodPurchases.reduce((sum, purchase) => sum + purchase.total, 0) +
    periodExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return {
    wholesaleOpen,
    retailOpen,
    productCount: products.length,
    customerCount: customers.length,
    storeCount: stores.length,
    purchaseCount: periodPurchases.length,
    criticalStock: products.filter((product) => product.quantity <= product.minQuantity).length,
    wholesaleRevenue,
    retailRevenue,
    expenseTotal,
    balance: wholesaleRevenue + retailRevenue - expenseTotal,
    headcount: roster.length,
    onLeave: roster.filter((employee) => employee.status === 'leave').length,
    payroll: payrollForPeriod(employees, period),
  }
}
