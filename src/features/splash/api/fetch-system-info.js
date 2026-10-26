import { apiClient } from '@/services/api-client'

// GET /api/system/info (anonymous) → { appName, version, environment, copyright, architectureNote }
export async function fetchSystemInfo() {
  return apiClient.get('/system/info')
}
