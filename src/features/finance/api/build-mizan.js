import { payrollForMonth } from '@/features/hr/api/payroll'
import { currentMonthKey, formatMonth, monthKey } from '@/lib/date'

export function buildMizan({ orders, expenses, purchases, employees }) {
  const buckets = new Map()

  function bucket(key) {
    if (!buckets.has(key)) {
      buckets.set(key, { key, label: formatMonth(key), income: 0, expense: 0 })
    }
    return buckets.get(key)
  }

  for (const order of orders) {
    bucket(monthKey(order.createdAt)).income += order.total
  }

  for (const expense of expenses) {
    bucket(monthKey(expense.createdAt)).expense += expense.amount
  }

  for (const purchase of purchases) {
    bucket(monthKey(purchase.createdAt)).expense += purchase.total
  }

  const keys = new Set(buckets.keys())
  keys.add(currentMonthKey())

  for (const key of keys) {
    bucket(key).expense += payrollForMonth(employees, key)
  }

  return [...buckets.values()]
    .map((row) => ({ ...row, balance: row.income - row.expense }))
    .sort((a, b) => (a.key < b.key ? 1 : -1))
}
