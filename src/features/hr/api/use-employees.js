import { useHrStore } from '@/store/hr-store'

export function useEmployees() {
  const { employees } = useHrStore()

  return {
    employees,
    headcount: employees.length,
    onLeave: employees.filter((employee) => employee.status === 'leave').length,
  }
}
