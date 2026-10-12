import { useEffect, useState } from 'react'

// Runs `fetcher(params)` whenever `params` change (compared by value) and on reload().
// `fetcher` must be a stable, module-level function. While a new request runs, the previous data stays
// available (`isLoading` is true), so numbers do not blink to empty when a filter changes.
export function useApiQuery(fetcher, params = {}) {
  const key = JSON.stringify(params)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ requestKey: null, data: null, error: '' })
  const requestKey = `${key}#${attempt}`

  useEffect(() => {
    let cancelled = false

    fetcher(JSON.parse(key))
      .then((data) => {
        if (!cancelled) {
          setResult({ requestKey: `${key}#${attempt}`, data, error: '' })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setResult((current) => ({ requestKey: `${key}#${attempt}`, data: current.data, error: error.message }))
        }
      })

    return () => {
      cancelled = true
    }
  }, [fetcher, key, attempt])

  const isLoading = result.requestKey !== requestKey

  return {
    data: result.data,
    // An error belongs to the request that failed; a newer request in flight clears it from view.
    error: isLoading ? '' : result.error,
    isLoading,
    reload: () => setAttempt((current) => current + 1),
  }
}
