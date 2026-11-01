import axios from 'axios'
import { getAuthState, logout, stopImpersonation } from '@/store/auth-store'
import { beginRetry, endRetry } from '@/store/connection-store'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5264/api'

// Requests where a 401 means "wrong credentials", not "session expired": show the error, keep the page.
const CREDENTIAL_PATHS = ['/auth/login']

// A request that got no response (API down or restarting, connection refused) is retried after these delays,
// so a short outage does not fail the page.
const NETWORK_RETRY_DELAYS_MS = [1000, 3000, 5000]

// Only idempotent methods are retried. The browser reports a dropped connection the same way as a refused one, so
// a POST (sale, payment, ...) may already have been processed; sending it again could record it twice.
const RETRYABLE_METHODS = new Set(['get', 'head', 'options', 'put', 'delete'])

function shouldRetry(error) {
  const config = error.config

  return Boolean(config)
    && !error.response
    && !axios.isCancel(error)
    && RETRYABLE_METHODS.has((config.method ?? 'get').toLowerCase())
    && (config.networkRetryCount ?? 0) < NETWORK_RETRY_DELAYS_MS.length
}

async function retryRequest(config) {
  const attempt = config.networkRetryCount ?? 0

  beginRetry()
  try {
    await new Promise((resolve) => setTimeout(resolve, NETWORK_RETRY_DELAYS_MS[attempt]))
    // Goes through the interceptors again: the latest token is attached and the response is unwrapped as usual.
    return await apiClient({ ...config, networkRetryCount: attempt + 1 })
  } finally {
    endRetry()
  }
}

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
    if (shouldRetry(error)) {
      return retryRequest(error.config)
    }

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
