import { apiClient } from '@/services/api-client'
import { enterCompany } from '@/store/auth-store'
import { setCompany } from '@/store/company-store'

// POST /api/companies/join: becomes staff of the company with this invite code.
// Spaces and dashes are ignored and case does not matter (the server normalises too).
export async function joinCompany({ inviteCode }) {
  const code = inviteCode.replace(/[\s-]/g, '').toUpperCase()

  if (!code) {
    return { ok: false, error: 'Dəvət kodu tələb olunur.' }
  }

  try {
    const company = await apiClient.post('/companies/join', { inviteCode: code })

    setCompany(company)
    enterCompany({ token: company.token, companyId: company.id, role: company.role })

    return { ok: true, company }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

// GET /api/companies/my-company → { id, name, voen, inviteCode, memberCount } (admins only).
export async function fetchMyCompany() {
  const { company } = await apiClient.get('/companies/my-company')
  return company
}
