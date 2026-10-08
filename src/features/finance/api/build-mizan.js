import { formatMonth, monthKey } from '@/lib/date'

export function buildMizan({ orders, expenses, purchases }) {
  const buckets = new Map()

  function bucket(createdAt) {
    const key = monthKey(createdAt)
    if (!buckets.has(key)) {
      buckets.set(key, { key, label: formatMonth(key), income: 0, expense: 0 })
    }
    return buckets.get(key)
  }

  for (const order of orders) {
    bucket(order.createdAt).income += order.total
  }

  for (const expense of expenses) {
    bucket(expense.createdAt).expense += expense.amount
  }

  for (const purchase of purchases) {
    bucket(purchase.createdAt).expense += purchase.total
  }

  return [...buckets.values()]
    .map((row) => ({ ...row, balance: row.income - row.expense }))
    .sort((a, b) => (a.key < b.key ? 1 : -1))
}
