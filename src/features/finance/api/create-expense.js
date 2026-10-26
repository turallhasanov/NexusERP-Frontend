import { apiClient } from '@/services/api-client'
import { loadCashRegisters } from '@/store/cash-registers-store'
import { addExpenseCategory, findExpenseCategoryByName } from '@/store/expense-categories-store'
import { upsertExpense } from '@/store/finance-store'

// The form offers common categories (Kirayə, Kommunal…) before the company has created any; the first expense of
// such a category creates it.
async function ensureCategoryId(name) {
  const existing = findExpenseCategoryByName(name)

  if (existing) {
    return existing.id
  }

  const created = await apiClient.post('/expense-categories', { name })
  return addExpenseCategory(created).id
}

// POST /api/expenses: paid from `cashRegisterId` (its balance goes down); `storeId` is optional, for store profit.
export async function createExpense({ category, amount, cashRegisterId, storeId, note }) {
  try {
    const expenseCategoryId = await ensureCategoryId(category)
    const expense = await apiClient.post('/expenses', {
      expenseCategoryId,
      cashRegisterId,
      amount,
      storeId: storeId || null,
      note: note || null,
    })

    // The register's balance changed on the server.
    void loadCashRegisters()
    return { ok: true, expense: upsertExpense(expense) }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
