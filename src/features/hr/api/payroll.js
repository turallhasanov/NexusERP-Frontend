import { isEmployedInMonth } from '@/lib/date'

export function payrollForMonth(employees, monthKey) {
  return employees.reduce((sum, employee) => {
    if (!isEmployedInMonth(employee, monthKey)) {
      return sum
    }

    return sum + employee.salary
  }, 0)
}
