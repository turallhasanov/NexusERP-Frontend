import { apiClient } from '@/services/api-client'
import { login } from '@/store/auth-store'

export async function signIn({ email, password }) {
  if (!email.trim() || !password.trim()) {
    return { ok: false, error: 'E-poçt və şifrə tələb olunur.' }
  }

  try {
    const { token, user } = await apiClient.post('/auth/login', { email: email.trim(), password })
    login({ token, user })
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
