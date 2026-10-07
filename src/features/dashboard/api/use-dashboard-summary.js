import { useCustomersStore } from '@/store/customers-store'
import { useFinanceStore } from '@/store/finance-store'
import { useHrStore } from '@/store/hr-store'
import { useInventoryStore } from '@/store/inventory-store'
import { useOrdersStore } from '@/store/orders-store'
import { usePurchasesStore } from '@/store/purchases-store'
import { useStoresStore } from '@/store/stores-store'

export function useDashboardSummary() {
  const { orders } = useOrdersStore()
  const { products } = useInventoryStore()
  const { customers } = useCustomersStore()
  const { stores } = useStoresStore()
  const { employees } = useHrStore()
  const { expenses } = useFinanceStore()
  const { purchases } = usePurchasesStore()

  const wholesaleOpen = orders.filter(
    (order) => order.type === 'wholesale' && order.status === 'open',
  ).length
  const retailOpen = orders.filter(
    (order) => order.type === 'retail' && order.status === 'open',
  ).length
  const productCount = products.length
  const customerCount = customers.length
  const storeCount = stores.length
  const purchaseCount = purchases.length
  const criticalStock = products.filter(
    (product) => product.quantity <= product.minQuantity,
  ).length
  const wholesaleRevenue = orders
    .filter((order) => order.type === 'wholesale')
    .reduce((sum, order) => sum + order.total, 0)
  const retailRevenue = orders
    .filter((order) => order.type === 'retail')
    .reduce((sum, order) => sum + order.total, 0)
  const revenue = wholesaleRevenue + retailRevenue
  const purchaseTotal = purchases.reduce((sum, purchase) => sum + purchase.total, 0)
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0) + purchaseTotal
  const balance = revenue - expenseTotal
  const headcount = employees.length
  const onLeave = employees.filter((employee) => employee.status === 'leave').length

  return {
    wholesaleOpen,
    retailOpen,
    productCount,
    customerCount,
    storeCount,
    purchaseCount,
    criticalStock,
    wholesaleRevenue,
    retailRevenue,
    expenseTotal,
    balance,
    headcount,
    onLeave,
  }
}
