import { payrollForMonth, payrollForYear } from '@/features/hr/api/payroll'
import {
  currentPeriodKey,
  formatPeriod,
  PERIOD_DAY,
  PERIOD_YEAR,
  periodKey,
} from '@/lib/date'

export function buildMizan({ orders, expenses, purchases, employees, period }) {
  const buckets = new Map()

  function bucket(key) {
    if (!buckets.has(key)) {
      buckets.set(key, { key, label: formatPeriod(key, period), income: 0, expense: 0 })
    }
    return buckets.get(key)
  }

  for (const order of orders) {
    bucket(periodKey(order.createdAt, period)).income += order.total
  }

  for (const expense of expenses) {
    bucket(periodKey(expense.createdAt, period)).expense += expense.amount
  }

  for (const purchase of purchases) {
    bucket(periodKey(purchase.createdAt, period)).expense += purchase.total
  }

  const keys = new Set(buckets.keys())
  keys.add(currentPeriodKey(period))

  if (period !== PERIOD_DAY) {
    for (const key of keys) {
      bucket(key).expense +=
        period === PERIOD_YEAR ? payrollForYear(employees, Number(key)) : payrollForMonth(employees, key)
    }
  }

  return [...buckets.values()]
    .map((row) => ({ ...row, balance: row.income - row.expense }))
    .sort((a, b) => (a.key < b.key ? 1 : -1))
}
