import { terminateEmployee } from '@/store/hr-store'

export function setEmployeeTerminated(employeeId) {
  terminateEmployee(employeeId)

  return { ok: true }
}
