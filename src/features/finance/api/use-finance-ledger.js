import { useFinanceStore } from '@/store/finance-store'
import { useOrdersStore } from '@/store/orders-store'
import { usePurchasesStore } from '@/store/purchases-store'

export function useFinanceLedger() {
  const { orders } = useOrdersStore()
  const { expenses } = useFinanceStore()
  const { purchases } = usePurchasesStore()
  const income = orders.reduce((sum, order) => sum + order.total, 0)
  const purchaseExpenses = purchases.map((purchase) => ({
    id: `purchase-${purchase.id}`,
    number: purchase.number,
    category: 'Alış',
    amount: purchase.total,
  }))
  const ledgerExpenses = [...purchaseExpenses, ...expenses]
  const expenseTotal = ledgerExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const balance = income - expenseTotal

  return {
    entries: orders,
    expenses: ledgerExpenses,
    income,
    expenseTotal,
    balance,
  }
}
