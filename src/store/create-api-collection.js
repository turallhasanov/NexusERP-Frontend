import { useEffect, useSyncExternalStore } from 'react'
import { apiClient } from '@/services/api-client'
import { getAuthState, subscribeAuth } from '@/store/auth-store'

const EMPTY_STATE = {
  items: [],
  status: 'idle',
  error: '',
}

// A company-scoped list cached from the API: loaded the first time a component reads it, shared by every
// module, and dropped when the session or active company changes so another tenant's rows never show.
// `fetchItems` returns the raw rows; `fromApi` maps each row (and rows added after a create) to the
// shape the UI uses.
export function createApiCollection({ path, fetchItems, fromApi = (item) => item }) {
  let state = EMPTY_STATE
  let request = null
  // Bumped on reset, so a response for the previous session is ignored when it lands.
  let generation = 0
  let companyId = getAuthState().activeCompanyId

  const listeners = new Set()

  function setState(next) {
    state = next

    for (const listener of listeners) {
      listener()
    }
  }

  function getState() {
    return state
  }

  function subscribe(listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  async function fetchRows() {
    if (fetchItems) {
      return fetchItems()
    }

    const { items } = await apiClient.get(path)
    return items
  }

  function load() {
    if (request) {
      return request
    }

    const requestGeneration = generation
    setState({ ...state, status: 'loading', error: '' })

    request = fetchRows()
      .then((rows) => {
        if (requestGeneration === generation) {
          setState({ items: rows.map(fromApi), status: 'ready', error: '' })
        }
      })
      .catch((error) => {
        if (requestGeneration === generation) {
          setState({ ...state, status: 'error', error: error.message })
        }
      })
      .finally(() => {
        if (requestGeneration === generation) {
          request = null
        }
      })

    return request
  }

  function ensureLoaded() {
    if (state.status === 'idle') {
      void load()
    }
  }

  function reset() {
    generation += 1
    request = null
    setState(EMPTY_STATE)
  }

  // New rows go last, matching the server's order (by code), so the list does not jump on the next load.
  function add(row) {
    const item = fromApi(row)
    setState({ ...state, items: [...state.items, item] })
    return item
  }

  // For documents, which the server lists newest first: replaces the row with the same id, or puts a new
  // one at the top.
  function upsert(row) {
    const item = fromApi(row)
    const exists = state.items.some((current) => current.id === item.id)

    setState({
      ...state,
      items: exists
        ? state.items.map((current) => (current.id === item.id ? item : current))
        : [item, ...state.items],
    })

    return item
  }

  function update(id, change) {
    setState({
      ...state,
      items: state.items.map((item) => (item.id === id ? change(item) : item)),
    })
  }

  function find(id) {
    return state.items.find((item) => item.id === id) ?? null
  }

  function useCollection() {
    const snapshot = useSyncExternalStore(subscribe, getState, getState)

    useEffect(() => {
      ensureLoaded()
    }, [])

    return {
      items: snapshot.items,
      // "idle" counts as loading: the effect above starts the request right after the first render.
      isLoading: snapshot.status === 'idle' || snapshot.status === 'loading',
      error: snapshot.status === 'error' ? snapshot.error : '',
      reload: load,
    }
  }

  subscribeAuth(() => {
    const next = getAuthState().activeCompanyId

    if (next !== companyId) {
      companyId = next
      reset()
    }
  })

  return { getState, load, ensureLoaded, reset, add, upsert, update, find, useCollection }
}
