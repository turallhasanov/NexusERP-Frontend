import { payrollForMonth } from '@/features/hr/api/payroll'
import { currentMonthKey } from '@/lib/date'
import { useHrStore } from '@/store/hr-store'

export function useEmployees() {
  const { employees } = useHrStore()
  const roster = employees.filter((employee) => employee.status !== 'left')

  return {
    employees,
    headcount: roster.length,
    onLeave: roster.filter((employee) => employee.status === 'leave').length,
    payroll: payrollForMonth(employees, currentMonthKey()),
  }
}
