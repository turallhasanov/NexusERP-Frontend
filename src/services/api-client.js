import axios from 'axios'
import { getAuthState, logout, stopImpersonation } from '@/store/auth-store'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5264/api'

// Requests where a 401 means "wrong credentials", not "session expired": show the error, keep the page.
const CREDENTIAL_PATHS = ['/auth/login']

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const { token, activeCompanyId } = getAuthState()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // The server takes the company from the token's companyId claim; this header is informational only.
  if (activeCompanyId) {
    config.headers['X-Company-Id'] = activeCompanyId
  }

  return config
})

// Callers get the payload, not the axios response: { ok: true, data } → data,
// { ok: true, ...fields } → { ...fields }. Failures reject with an ApiError carrying the server's message.
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data

    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return body
    }

    if (body.ok === false) {
      return Promise.reject(new ApiError(body.error ?? 'Naməlum xəta baş verdi.', response.status))
    }

    if ('data' in body) {
      return body.data
    }

    // eslint-disable-next-line no-unused-vars
    const { ok, ...payload } = body
    return payload
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.error

    if (status === 401 && !CREDENTIAL_PATHS.includes(error.config?.url)) {
      if (getAuthState().impersonation) {
        // An expired company view only ends the view: the platform admin goes back to the admin panel.
        stopImpersonation()
      } else {
        // Every page except /login sits behind RequireAuth, so clearing the session redirects to /login.
        logout()
      }
    }

    if (!error.response) {
      return Promise.reject(new ApiError('Serverə qoşulmaq mümkün olmadı.', 0))
    }

    return Promise.reject(new ApiError(message ?? `Sorğu uğursuz oldu (${status}).`, status))
  },
)
