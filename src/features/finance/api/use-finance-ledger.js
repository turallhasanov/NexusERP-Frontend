import { useFinanceStore } from '@/store/finance-store'
import { useOrdersStore } from '@/store/orders-store'

export function useFinanceLedger() {
  const { orders } = useOrdersStore()
  const { expenses } = useFinanceStore()
  const income = orders.reduce((sum, order) => sum + order.total, 0)
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const balance = income - expenseTotal

  return {
    entries: orders,
    expenses,
    income,
    expenseTotal,
    balance,
  }
}
