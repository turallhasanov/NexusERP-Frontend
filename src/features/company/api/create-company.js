import { apiClient } from '@/services/api-client'
import { enterCompany } from '@/store/auth-store'
import { setCompany } from '@/store/company-store'

export async function createCompany({ name, voen }) {
  const trimmed = name.trim()

  if (!trimmed) {
    return { ok: false, error: 'Şirkət adı tələb olunur.' }
  }

  try {
    const company = await apiClient.post('/company', { name: trimmed, voen: voen.trim() })

    // The new token carries the companyId claim; company-scoped endpoints reject the old one.
    setCompany(company)
    enterCompany({ token: company.token, companyId: company.id, role: company.role })

    return { ok: true }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
