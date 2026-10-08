import { buildMizan } from '@/features/finance/api/build-mizan'
import { buildStoreMizan } from '@/features/finance/api/build-store-mizan'
import { payrollForPeriod } from '@/features/hr/api/payroll'
import { isInPeriod, PERIOD_DAY, PERIOD_MONTH } from '@/lib/date'
import { useFinanceStore } from '@/store/finance-store'
import { useHrStore } from '@/store/hr-store'
import { useOrdersStore } from '@/store/orders-store'
import { usePurchasesStore } from '@/store/purchases-store'
import { useStoresStore } from '@/store/stores-store'
import { useWarehousesStore } from '@/store/warehouses-store'

export function useFinanceLedger(period = PERIOD_MONTH) {
  const { orders } = useOrdersStore()
  const { expenses } = useFinanceStore()
  const { purchases } = usePurchasesStore()
  const { stores } = useStoresStore()
  const { warehouses } = useWarehousesStore()
  const { employees } = useHrStore()
  const periodOrders = orders.filter((order) => isInPeriod(order.createdAt, period))
  const periodExpenses = expenses.filter((expense) => isInPeriod(expense.createdAt, period))
  const periodPurchases = purchases.filter((purchase) => isInPeriod(purchase.createdAt, period))
  const income = periodOrders.reduce((sum, order) => sum + order.total, 0)
  const payroll = payrollForPeriod(employees, period)
  const purchaseExpenses = periodPurchases.map((purchase) => ({
    id: `purchase-${purchase.id}`,
    number: purchase.number,
    category: 'Alış',
    amount: purchase.total,
    createdAt: purchase.createdAt,
  }))
  const payrollExpense =
    period !== PERIOD_DAY && payroll > 0
      ? [{ id: 'payroll-current', number: 'MAAŞ', category: 'Maaş fondu', amount: payroll }]
      : []
  const ledgerExpenses = [...payrollExpense, ...purchaseExpenses, ...periodExpenses]
  const expenseTotal =
    periodPurchases.reduce((sum, purchase) => sum + purchase.total, 0) +
    periodExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const balance = income - expenseTotal
  const months = buildMizan({ orders, expenses, purchases, employees, period })
  const storeMonths = buildStoreMizan({ orders, purchases, stores, warehouses, period })

  return {
    entries: periodOrders,
    expenses: ledgerExpenses,
    months,
    storeMonths,
    income,
    expenseTotal,
    payroll,
    balance,
  }
}
