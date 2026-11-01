import { apiClient } from '@/services/api-client'
import { markCustomerDeleted } from '@/store/customers-store'

// DELETE /api/customers/{id}: company admins and IT admins only. A system counterparty is refused (400,
// "Sistem kontragenti silinə bilməz."). One that purchases or sales reference is deactivated instead: `deactivated` is
// true and `message` says so.
export async function deleteCustomer(id) {
  try {
    const { deactivated, message } = await apiClient.delete(`/customers/${encodeURIComponent(id)}`)
    markCustomerDeleted(id, deactivated)
    return { ok: true, deactivated, message }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
