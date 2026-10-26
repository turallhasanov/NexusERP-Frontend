import { createApiCollection } from '@/store/create-api-collection'

// API status → the one the HR, dashboard and finance modules use (payroll counts everyone but 'left').
const STATUS_FROM_API = {
  active: 'active',
  onLeave: 'leave',
  terminated: 'left',
}

// GET /api/employees row → the employee shape the modules use. Dates are "YYYY-MM-DD" strings.
export function toEmployee(employee) {
  return {
    id: employee.id,
    name: employee.fullName,
    title: employee.title,
    department: employee.department,
    status: STATUS_FROM_API[employee.status] ?? 'active',
    hiredAt: employee.hiredAt,
    leftAt: employee.terminatedAt ?? null,
    salary: employee.salary,
    storeId: employee.storeId ?? null,
    vacationStartDate: employee.vacationStartDate ?? null,
    vacationEndDate: employee.vacationEndDate ?? null,
    leaveType: employee.leaveType ?? null,
    vacationNote: employee.vacationNote ?? null,
    terminationReason: employee.terminationReason ?? null,
    terminationOrderNumber: employee.terminationOrderNumber ?? null,
  }
}

// The server lists newest first and closes leaves that ended before today on every load.
const employees = createApiCollection({ path: '/employees', fromApi: toEmployee })

export const loadEmployees = employees.load

// A new employee goes to the top; an updated one (leave, return, termination) replaces its row.
export function upsertEmployee(employee) {
  return employees.upsert(employee)
}

export function removeEmployee(employeeId) {
  employees.remove(employeeId)
}

export function useHrStore() {
  const { items, isLoading, error, reload } = employees.useCollection()

  return { employees: items, isLoading, error, reload }
}
