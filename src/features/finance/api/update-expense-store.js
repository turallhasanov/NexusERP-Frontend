import { apiClient } from '@/services/api-client'
import { upsertExpense } from '@/store/finance-store'

// PUT /api/expenses/{id}/store: admins and IT admins only. An empty storeId makes the expense company-wide.
export async function updateExpenseStore(id, storeId) {
  const expense = await apiClient.put(`/expenses/${encodeURIComponent(id)}/store`, { storeId: storeId || null })
  return upsertExpense(expense)
}
