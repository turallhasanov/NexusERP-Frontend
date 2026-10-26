import { payrollForPeriod } from '@/features/hr/api/payroll'
import { isInPeriod, PERIOD_DAY, PERIOD_MONTH } from '@/lib/date'
import { useFinanceStore } from '@/store/finance-store'
import { useHrStore } from '@/store/hr-store'
import { SALE_APPROVED, useOrdersStore } from '@/store/orders-store'
import { PURCHASE_APPROVED, usePurchasesStore } from '@/store/purchases-store'

export function useFinanceLedger(period = PERIOD_MONTH) {
  // Only approved documents are income / expense; drafts have not moved stock or money yet.
  const orders = useOrdersStore().orders.filter((order) => order.status === SALE_APPROVED)
  const { expenses } = useFinanceStore()
  const purchases = usePurchasesStore().purchases.filter((purchase) => purchase.status === PURCHASE_APPROVED)
  const { employees } = useHrStore()
  const periodOrders = orders.filter((order) => isInPeriod(order.createdAt, period))
  const periodExpenses = expenses.filter((expense) => isInPeriod(expense.createdAt, period))
  const periodPurchases = purchases.filter((purchase) => isInPeriod(purchase.createdAt, period))
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

  return {
    entries: periodOrders,
    expenses: ledgerExpenses,
  }
}
