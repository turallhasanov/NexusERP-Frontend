import { apiClient } from '@/services/api-client'

// Checks what the browser can know (empty fields, matching passwords); length, complexity and a taken
// e-mail are checked by the server, whose Azerbaijani message comes back in `error`.
// On success the account exists but is unconfirmed: a 6-digit code was e-mailed, and the user logs in by
// entering it on /verify-email. Returns { ok, email, message, resendAfterSeconds }.
export async function register({ fullName, email, password, passwordConfirm }) {
  if (!fullName.trim()) {
    return { ok: false, error: 'Ad Soyad tələb olunur.' }
  }

  if (!email.trim()) {
    return { ok: false, error: 'E-poçt tələb olunur.' }
  }

  if (!password) {
    return { ok: false, error: 'Şifrə tələb olunur.' }
  }

  if (!passwordConfirm) {
    return { ok: false, error: 'Şifrə təkrarı tələb olunur.' }
  }

  if (password !== passwordConfirm) {
    return { ok: false, error: 'Şifrələr üst-üstə düşmür.' }
  }

  try {
    const result = await apiClient.post('/auth/register', {
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    })

    return { ok: true, ...result }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
