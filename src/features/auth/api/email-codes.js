import { apiClient } from '@/services/api-client'
import { login } from '@/store/auth-store'

// Every call returns { ok: true, ...payload } or { ok: false, error, status }; errors are the server's
// Azerbaijani messages. Code steps return { email, message, resendAfterSeconds }.
async function call(request) {
  try {
    return { ok: true, ...(await request()) }
  } catch (error) {
    return { ok: false, error: error.message, status: error.status }
  }
}

// POST /api/auth/verify-email-otp → token; logs the user in.
export async function verifyEmailCode({ email, code }) {
  const result = await call(() => apiClient.post('/auth/verify-email-otp', { email, code }))

  if (result.ok) {
    login({ token: result.token, user: result.user })
  }

  return result
}

// POST /api/auth/resend-otp → a new registration code (429 within a minute of the last one).
export function resendEmailCode(email) {
  return call(() => apiClient.post('/auth/resend-otp', { email }))
}

// POST /api/auth/forgot-password → a reset code, if the address has an account (the answer never says).
export function requestPasswordReset(email) {
  if (!email.trim()) {
    return Promise.resolve({ ok: false, error: 'E-poçt tələb olunur.' })
  }

  return call(() => apiClient.post('/auth/forgot-password', { email: email.trim() }))
}

// POST /api/auth/reset-password. Empty fields and a mismatch are caught here; the rest by the server.
export function resetPassword({ email, code, newPassword, confirmPassword }) {
  if (code.length !== 6) {
    return Promise.resolve({ ok: false, error: 'Kod 6 rəqəmdən ibarət olmalıdır.' })
  }

  if (!newPassword) {
    return Promise.resolve({ ok: false, error: 'Yeni şifrə tələb olunur.' })
  }

  if (newPassword !== confirmPassword) {
    return Promise.resolve({ ok: false, error: 'Şifrələr üst-üstə düşmür.' })
  }

  return call(() => apiClient.post('/auth/reset-password', { email, code, newPassword }))
}
