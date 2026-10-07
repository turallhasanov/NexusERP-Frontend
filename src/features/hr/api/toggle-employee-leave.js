import { toggleEmployeeLeave } from '@/store/hr-store'

export function setEmployeeLeave(employeeId) {
  toggleEmployeeLeave(employeeId)

  return { ok: true }
}
