import { apiClient } from '@/services/api-client'
import { removeEmployee, upsertEmployee } from '@/store/hr-store'

// Writes are for company admins and IT admins. Each call throws an ApiError with the server's Azerbaijani
// message, and on success puts the returned employee into the cached list.

function employeePath(id) {
  return `/employees/${encodeURIComponent(id)}`
}

// POST /api/employees
export async function createEmployee({ name, title, department, hiredAt, salary, storeId }) {
  const { employee } = await apiClient.post('/employees', {
    fullName: name,
    title,
    department,
    hiredAt,
    salary,
    storeId: storeId || null,
  })
  return upsertEmployee(employee)
}

// PUT /api/employees/{id}: the whole profile, including the store (empty = company-wide staff).
export async function updateEmployee(id, { name, title, department, hiredAt, salary, storeId }) {
  const { employee } = await apiClient.put(employeePath(id), {
    fullName: name,
    title,
    department,
    hiredAt,
    salary,
    storeId: storeId || null,
  })
  return upsertEmployee(employee)
}

// POST /api/employees/{id}/vacation { startDate, endDate, leaveType, note }
export async function sendOnVacation(id, { startDate, endDate, leaveType, note }) {
  const { employee } = await apiClient.post(`${employeePath(id)}/vacation`, {
    startDate,
    endDate,
    leaveType,
    note: note || null,
  })
  return upsertEmployee(employee)
}

// POST /api/employees/{id}/return: "İşə qayıtdı".
export async function returnFromVacation(id) {
  const { employee } = await apiClient.post(`${employeePath(id)}/return`)
  return upsertEmployee(employee)
}

// POST /api/employees/{id}/terminate { terminationDate, reason }: also numbers the termination order.
export async function terminateEmployee(id, { terminationDate, reason }) {
  const { employee } = await apiClient.post(`${employeePath(id)}/terminate`, { terminationDate, reason })
  return upsertEmployee(employee)
}

// DELETE /api/employees/{id}: IT admins only (403 for everyone else). Removes the row from the cached list.
export async function deleteEmployee(id) {
  await apiClient.delete(employeePath(id))
  removeEmployee(id)
}

// GET /api/employees/{id}/termination-document. Takes `{ id }` for useApiQuery.
export async function fetchTerminationDocument({ id }) {
  const { document } = await apiClient.get(`${employeePath(id)}/termination-document`)
  return document
}
