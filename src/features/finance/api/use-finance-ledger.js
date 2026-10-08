import { buildMizan } from '@/features/finance/api/build-mizan'
import { isSameDay } from '@/lib/date'
import { useFinanceStore } from '@/store/finance-store'
import { useOrdersStore } from '@/store/orders-store'
import { usePurchasesStore } from '@/store/purchases-store'

export function useFinanceLedger() {
  const { orders } = useOrdersStore()
  const { expenses } = useFinanceStore()
  const { purchases } = usePurchasesStore()
  const todayOrders = orders.filter((order) => isSameDay(order.createdAt))
  const todayExpenses = expenses.filter((expense) => isSameDay(expense.createdAt))
  const todayPurchases = purchases.filter((purchase) => isSameDay(purchase.createdAt))
  const income = todayOrders.reduce((sum, order) => sum + order.total, 0)
  const purchaseExpenses = purchases.map((purchase) => ({
    id: `purchase-${purchase.id}`,
    number: purchase.number,
    category: 'Alış',
    amount: purchase.total,
  }))
  const ledgerExpenses = [...purchaseExpenses, ...expenses]
  const expenseTotal =
    todayPurchases.reduce((sum, purchase) => sum + purchase.total, 0) +
    todayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const balance = income - expenseTotal
  const months = buildMizan({ orders, expenses, purchases })

  return {
    entries: orders,
    expenses: ledgerExpenses,
    months,
    income,
    expenseTotal,
    balance,
  }
}
