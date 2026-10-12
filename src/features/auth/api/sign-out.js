import { apiClient } from '@/services/api-client'
import { logout } from '@/store/auth-store'

// JWTs are stateless, so the server call is a courtesy; the session ends locally even if it fails.
export function signOut() {
  apiClient.post('/auth/logout').catch(() => {})
  logout()
}
