import { setCompany } from '@/store/company-store'

export function createCompany({ name, voen }) {
  const trimmed = name.trim()

  if (!trimmed) {
    return { ok: false, error: 'Şirkət adı tələb olunur.' }
  }

  return setCompany({ name: trimmed, voen: voen.trim() })
}
