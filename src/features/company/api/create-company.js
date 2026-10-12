import { apiClient } from '@/services/api-client'
import { setActiveCompany, setToken } from '@/store/auth-store'
import { setCompany } from '@/store/company-store'

export async function createCompany({ name, voen }) {
  const trimmed = name.trim()

  if (!trimmed) {
    return { ok: false, error: 'Şirkət adı tələb olunur.' }
  }

  try {
    const company = await apiClient.post('/company', { name: trimmed, voen: voen.trim() })

    // The new token carries the companyId claim; company-scoped endpoints reject the old one.
    setToken(company.token)
    setCompany(company)
    setActiveCompany(company.id)

    return { ok: true }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
