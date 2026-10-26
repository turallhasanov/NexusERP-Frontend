import { fromApiDate, formatDate } from '@/lib/date'
import { createApiCollection } from '@/store/create-api-collection'

// GET /api/expenses row → the expense shape the finance page uses. `number` fills the ledger's document column
// (purchases show their invoice number there, expenses their date).
export function toExpense(expense) {
  const createdAt = fromApiDate(expense.expenseDate)

  return {
    id: expense.id,
    // Real expenses can be moved to another store; the ledger's purchase and payroll rows cannot.
    kind: 'expense',
    number: formatDate(createdAt),
    category: expense.expenseCategory?.name ?? '—',
    amount: expense.amount,
    createdAt,
    note: expense.note ?? null,
    cashRegisterId: expense.cashRegisterId,
    storeId: expense.storeId ?? null,
    store: expense.store?.name ?? null,
  }
}

// Newest first, like the server; a new expense goes to the top.
const expenses = createApiCollection({ path: '/expenses', fromApi: toExpense })

export const loadExpenses = expenses.load

export function upsertExpense(expense) {
  return expenses.upsert(expense)
}

export function useFinanceStore() {
  const { items, isLoading, error, reload } = expenses.useCollection()

  return { expenses: items, isLoading, error, reload }
}
