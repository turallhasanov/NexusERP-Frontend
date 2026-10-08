import { useSyncExternalStore } from 'react'
import { toDateInput } from '@/lib/date'

const INITIAL_EMPLOYEES = [
  {
    id: '1',
    name: 'Aysel Məmmədova',
    title: 'Administrator',
    department: 'İdarə',
    status: 'active',
    hiredAt: '2026-01-06',
    leftAt: null,
    salary: 1800,
  },
  {
    id: '2',
    name: 'Elvin Quliyev',
    title: 'Anbardar',
    department: 'Anbar',
    status: 'active',
    hiredAt: '2026-02-10',
    leftAt: null,
    salary: 1200,
  },
  {
    id: '3',
    name: 'Nigar Əliyeva',
    title: 'Satıcı',
    department: 'Satış',
    status: 'leave',
    hiredAt: '2026-03-01',
    leftAt: null,
    salary: 1100,
  },
]

let nextSequence = INITIAL_EMPLOYEES.length + 1

let state = {
  employees: INITIAL_EMPLOYEES,
}

const listeners = new Set()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getHrState() {
  return state
}

export function subscribeHr(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function addEmployee({ name, title, department, hiredAt, salary }) {
  const employee = {
    id: String(nextSequence),
    name,
    title,
    department,
    status: 'active',
    hiredAt,
    leftAt: null,
    salary,
  }

  nextSequence += 1
  state = { employees: [employee, ...state.employees] }
  emit()
}

export function toggleEmployeeLeave(employeeId) {
  state = {
    employees: state.employees.map((employee) => {
      if (employee.id !== employeeId || employee.status === 'left') {
        return employee
      }

      return { ...employee, status: employee.status === 'active' ? 'leave' : 'active' }
    }),
  }
  emit()
}

export function terminateEmployee(employeeId) {
  state = {
    employees: state.employees.map((employee) =>
      employee.id === employeeId && employee.status !== 'left'
        ? { ...employee, status: 'left', leftAt: toDateInput() }
        : employee,
    ),
  }
  emit()
}

export function useHrStore() {
  return useSyncExternalStore(subscribeHr, getHrState, getHrState)
}
