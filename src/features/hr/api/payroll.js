import { currentMonthKey, isEmployedInMonth, monthsEmployedInYear, PERIOD_YEAR } from '@/lib/date'

export function payrollForMonth(employees, monthKey) {
  return employees.reduce((sum, employee) => {
    if (!isEmployedInMonth(employee, monthKey)) {
      return sum
    }

    return sum + employee.salary
  }, 0)
}

export function payrollForYear(employees, year) {
  return employees.reduce((sum, employee) => sum + employee.salary * monthsEmployedInYear(employee, year), 0)
}

export function payrollForPeriod(employees, period, now = new Date()) {
  if (period === PERIOD_YEAR) {
    return payrollForYear(employees, now.getFullYear())
  }

  return payrollForMonth(employees, currentMonthKey(now))
}

export function payrollRows(employees, period, now = new Date()) {
  const year = now.getFullYear()

  return employees
    .filter((employee) =>
      period === PERIOD_YEAR
        ? monthsEmployedInYear(employee, year) > 0
        : isEmployedInMonth(employee, currentMonthKey(now)),
    )
    .map((employee) => ({
      ...employee,
      amount: period === PERIOD_YEAR ? employee.salary * monthsEmployedInYear(employee, year) : employee.salary,
    }))
}
