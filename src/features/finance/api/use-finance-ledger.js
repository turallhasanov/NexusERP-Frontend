import { buildMizan } from '@/features/finance/api/build-mizan'
import { buildStoreMizan } from '@/features/finance/api/build-store-mizan'
import { payrollForMonth } from '@/features/hr/api/payroll'
import { currentMonthKey, isSameDay } from '@/lib/date'
import { useFinanceStore } from '@/store/finance-store'
import { useHrStore } from '@/store/hr-store'
import { useOrdersStore } from '@/store/orders-store'
import { usePurchasesStore } from '@/store/purchases-store'
import { useStoresStore } from '@/store/stores-store'
import { useWarehousesStore } from '@/store/warehouses-store'

export function useFinanceLedger() {
  const { orders } = useOrdersStore()
  const { expenses } = useFinanceStore()
  const { purchases } = usePurchasesStore()
  const { stores } = useStoresStore()
  const { warehouses } = useWarehousesStore()
  const { employees } = useHrStore()
  const todayOrders = orders.filter((order) => isSameDay(order.createdAt))
  const todayExpenses = expenses.filter((expense) => isSameDay(expense.createdAt))
  const todayPurchases = purchases.filter((purchase) => isSameDay(purchase.createdAt))
  const income = todayOrders.reduce((sum, order) => sum + order.total, 0)
  const payroll = payrollForMonth(employees, currentMonthKey())
  const purchaseExpenses = purchases.map((purchase) => ({
    id: `purchase-${purchase.id}`,
    number: purchase.number,
    category: 'Alış',
    amount: purchase.total,
  }))
  const payrollExpense =
    payroll > 0
      ? [{ id: 'payroll-current', number: 'MAAŞ', category: 'Maaş fondu', amount: payroll }]
      : []
  const ledgerExpenses = [...payrollExpense, ...purchaseExpenses, ...expenses]
  const expenseTotal =
    todayPurchases.reduce((sum, purchase) => sum + purchase.total, 0) +
    todayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const balance = income - expenseTotal
  const months = buildMizan({ orders, expenses, purchases, employees })
  const storeMonths = buildStoreMizan({ orders, purchases, stores, warehouses })

  return {
    entries: orders,
    expenses: ledgerExpenses,
    months,
    storeMonths,
    income,
    expenseTotal,
    payroll,
    balance,
  }
}
