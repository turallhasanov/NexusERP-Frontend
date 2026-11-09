import { AxiosError, CanceledError } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/store/toast-store', () => ({ showToast: vi.fn() }))
vi.mock('@/store/connection-store', () => ({ beginRetry: vi.fn(), endRetry: vi.fn() }))
vi.mock('@/store/auth-store', () => ({
  getAuthState: vi.fn(() => ({ token: 'jwt-token', activeCompanyId: 'company-1', impersonation: null })),
  logout: vi.fn(),
  stopImpersonation: vi.fn(),
}))

const { apiClient, ApiError } = await import('@/services/api-client')
const { showToast } = await import('@/store/toast-store')
const auth = await import('@/store/auth-store')

const NETWORK_MESSAGE = 'Serverə qoşulmaq mümkün olmadı.'

// What NexusERP's GlobalExceptionHandler returns for an unhandled exception.
const PROBLEM_500 = {
  type: 'https://tools.ietf.org/html/rfc9110#section-15.6.1',
  title: 'An error occurred while processing your request.',
  status: 500,
  detail: 'Gözlənilməz xəta baş verdi. Bir az sonra yenidən cəhd edin; problem davam edərsə, trace id-ni dəstəyə göndərin.',
  instance: 'GET /api/customers',
  traceId: '00-abc-01',
  ok: false,
  error: 'Gözlənilməz xəta baş verdi. Bir az sonra yenidən cəhd edin; problem davam edərsə, trace id-ni dəstəyə göndərin.',
}

/** Replaces the HTTP layer: every request is answered by `answer(config)` (a response object, or a thrown error). */
function serve(answer) {
  const adapter = vi.fn(async (config) => {
    const result = await answer(config)
    if (result.status >= 200 && result.status < 300) {
      return { headers: {}, statusText: '', config, ...result }
    }
    const response = { headers: {}, statusText: '', config, ...result }
    throw new AxiosError(`Request failed with status code ${result.status}`, 'ERR_BAD_RESPONSE', config, null, response)
  })
  apiClient.defaults.adapter = adapter
  return adapter
}

function networkDown() {
  const adapter = vi.fn(async (config) => {
    throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, {})
  })
  apiClient.defaults.adapter = adapter
  return adapter
}

beforeEach(() => {
  vi.mocked(showToast).mockClear()
  vi.mocked(auth.logout).mockClear()
  vi.mocked(auth.stopImpersonation).mockClear()
  vi.mocked(auth.getAuthState).mockReturnValue({ token: 'jwt-token', activeCompanyId: 'company-1', impersonation: null })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('apiClient success path', () => {
  it('sends the bearer token and unwraps { ok: true, ...fields }', async () => {
    const adapter = serve(() => ({ status: 200, data: { ok: true, items: [{ id: 'c-1' }] } }))

    await expect(apiClient.get('/customers')).resolves.toEqual({ items: [{ id: 'c-1' }] })
    expect(adapter.mock.calls[0][0].headers.Authorization).toBe('Bearer jwt-token')
    expect(showToast).not.toHaveBeenCalled()
  })

  it('turns a 200 { ok: false } into an ApiError without a toast', async () => {
    serve(() => ({ status: 200, data: { ok: false, error: 'Xəta' } }))

    await expect(apiClient.get('/x')).rejects.toMatchObject({ name: 'ApiError', message: 'Xəta', status: 200 })
    expect(showToast).not.toHaveBeenCalled()
  })
})

describe('apiClient server faults (5xx)', () => {
  it('shows the RFC 7807 error message as an error toast and rejects with it', async () => {
    serve(() => ({ status: 500, data: PROBLEM_500 }))

    const error = await apiClient.get('/customers').catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ message: PROBLEM_500.error, status: 500 })
    expect(showToast).toHaveBeenCalledOnce()
    expect(showToast).toHaveBeenCalledWith(PROBLEM_500.error, 'error')
  })

  it.each([502, 503, 504])('reports a %i without a body with a generic message', async (status) => {
    serve(() => ({ status, data: '' }))

    await expect(apiClient.get('/x')).rejects.toMatchObject({ status, message: `Sorğu uğursuz oldu (${status}).` })
    expect(showToast).toHaveBeenCalledWith(`Sorğu uğursuz oldu (${status}).`, 'error')
  })

  it('is not retried: the request is sent once', async () => {
    const adapter = serve(() => ({ status: 500, data: PROBLEM_500 }))

    await apiClient.get('/customers').catch(() => {})

    expect(adapter).toHaveBeenCalledOnce()
  })
})

describe('apiClient client errors (4xx) stay with the page', () => {
  it.each([
    [400, 'Sistem kontragenti silinə bilməz.'],
    [404, 'Kontragent tapılmadı.'],
    [409, 'Bu barkod artıq başqa məhsulda istifadə olunur.'],
    [422, 'Stok çatmır.'],
  ])('a %i rejects with the server message and shows no toast', async (status, message) => {
    serve(() => ({ status, data: { ok: false, error: message } }))

    await expect(apiClient.delete('/customers/c-1')).rejects.toMatchObject({ status, message })
    expect(showToast).not.toHaveBeenCalled()
  })
})

describe('apiClient 401 / 403', () => {
  it('a 401 ends the session without a toast', async () => {
    serve(() => ({ status: 401, data: { ok: false, error: 'Giriş tələb olunur.' } }))

    await expect(apiClient.get('/customers')).rejects.toMatchObject({ status: 401 })
    expect(auth.logout).toHaveBeenCalledOnce()
    expect(showToast).not.toHaveBeenCalled()
  })

  it('a 401 during a company view only ends the view', async () => {
    vi.mocked(auth.getAuthState).mockReturnValue({ token: 't', activeCompanyId: 'c', impersonation: { companyId: 'c' } })
    serve(() => ({ status: 401, data: { ok: false, error: 'Giriş tələb olunur.' } }))

    await apiClient.get('/customers').catch(() => {})

    expect(auth.stopImpersonation).toHaveBeenCalledOnce()
    expect(auth.logout).not.toHaveBeenCalled()
  })

  it('a 401 from the login form is wrong credentials, not an expired session', async () => {
    serve(() => ({ status: 401, data: { ok: false, error: 'E-poçt və ya şifrə yanlışdır.' } }))

    await expect(apiClient.post('/auth/login', {})).rejects.toMatchObject({ message: 'E-poçt və ya şifrə yanlışdır.' })
    expect(auth.logout).not.toHaveBeenCalled()
  })

  it('a 403 rejects with the message and keeps the session', async () => {
    serve(() => ({ status: 403, data: { ok: false, error: 'Bu əməliyyat üçün icazəniz yoxdur.' } }))

    await expect(apiClient.delete('/customers/c-1')).rejects.toMatchObject({ status: 403, message: 'Bu əməliyyat üçün icazəniz yoxdur.' })
    expect(auth.logout).not.toHaveBeenCalled()
    expect(showToast).not.toHaveBeenCalled()
  })
})

describe('apiClient network failures', () => {
  it('a POST is never resent and reports the outage once', async () => {
    const adapter = networkDown()

    const error = await apiClient.post('/sales', {}).catch((e) => e)

    expect(error).toMatchObject({ name: 'ApiError', message: NETWORK_MESSAGE, status: 0 })
    expect(adapter).toHaveBeenCalledOnce()
    expect(showToast).toHaveBeenCalledOnce()
    expect(showToast).toHaveBeenCalledWith(NETWORK_MESSAGE, 'error')
  })

  it('a GET is retried after 1, 3 and 5 seconds before the outage is reported', async () => {
    vi.useFakeTimers()
    const adapter = networkDown()

    const settled = apiClient.get('/customers').catch((e) => e)
    await vi.advanceTimersByTimeAsync(1000 + 3000 + 5000)
    const error = await settled

    expect(adapter).toHaveBeenCalledTimes(4)
    expect(error).toMatchObject({ status: 0, message: NETWORK_MESSAGE })
    expect(showToast).toHaveBeenCalledOnce()
  })

  it('a GET that recovers during the retries succeeds without a toast', async () => {
    vi.useFakeTimers()
    let calls = 0
    serve(() => {
      calls += 1
      if (calls === 1) throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, {}, {})
      return { status: 200, data: { ok: true, items: [] } }
    })

    const settled = apiClient.get('/customers')
    await vi.advanceTimersByTimeAsync(1000)

    await expect(settled).resolves.toEqual({ items: [] })
    expect(showToast).not.toHaveBeenCalled()
  })

  it('a request the page cancelled is not reported', async () => {
    apiClient.defaults.adapter = vi.fn(async () => {
      throw new CanceledError()
    })

    await expect(apiClient.get('/customers')).rejects.toBeInstanceOf(ApiError)
    expect(showToast).not.toHaveBeenCalled()
  })
})
