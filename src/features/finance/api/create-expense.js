import { addExpense } from '@/store/finance-store'

export function createExpense({ category, amount }) {
  addExpense({ category, amount })

  return { ok: true }
}
