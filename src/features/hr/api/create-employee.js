import { addEmployee } from '@/store/hr-store'

export function createEmployee({ name, title, department }) {
  addEmployee({ name, title, department })

  return { ok: true }
}
