const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7001'

export async function apiClient(path, options = {}) {
  const headers = new Headers({
    Accept: 'application/json',
  })

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    throw new Error(`API ${response.status}`)
  }

  if (response.status === 204) {
    return undefined
  }

  return response.json()
}
