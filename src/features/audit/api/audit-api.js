import { apiClient } from '@/services/api-client'

// GET /api/admin/audit-logs (IT admins only) → { items, total, page, pageSize }, newest first. Empty filters are left
// out. Takes the filter object for useApiQuery.
export function fetchAuditLogs({ department, actionType, startDate, endDate, page }) {
  const params = { page, pageSize: 50 }

  if (department) params.department = department
  if (actionType) params.actionType = actionType
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate

  return apiClient.get('/admin/audit-logs', { params })
}
