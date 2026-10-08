import { addEmployee } from '@/store/hr-store'

export function createEmployee({ name, title, department, hiredAt, salary }) {
  addEmployee({ name, title, department, hiredAt, salary })

  return { ok: true }
}
