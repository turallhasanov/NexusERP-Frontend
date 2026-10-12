import { useSyncExternalStore } from 'react'
import { isTokenExpired } from '@/lib/jwt'
import { clearCompany } from '@/store/company-store'

const STORAGE_KEY = 'nexuserp-auth'

const EMPTY_STATE = {
  token: null,
  user: null,
  activeCompanyId: null,
}

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return EMPTY_STATE
    }

    const parsed = JSON.parse(raw)

    // An expired token would only earn a 401 on the first request; start logged out instead.
    if (!parsed?.token || isTokenExpired(parsed.token)) {
      localStorage.removeItem(STORAGE_KEY)
      return EMPTY_STATE
    }

    return {
      token: parsed.token,
      user: parsed.user ?? null,
      activeCompanyId: parsed.activeCompanyId ?? null,
    }
  } catch {
    return EMPTY_STATE
  }
}

let state = typeof localStorage === 'undefined' ? EMPTY_STATE : readStoredAuth()

const listeners = new Set()

function setState(next) {
  state = next

  if (state.token) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }

  for (const listener of listeners) {
    listener()
  }
}

export function getAuthState() {
  return state
}

export function subscribeAuth(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Starts a session from POST /api/auth/login. The company is chosen separately on /select-company.
export function login({ token, user }) {
  setState({ token, user, activeCompanyId: null })
}

// Clears the session and the cached company, so the next user never sees the previous one's data.
export function logout() {
  setState(EMPTY_STATE)
  clearCompany()
}

// POST /api/company issues a new token that carries the companyId claim; it replaces the old one.
export function setToken(token) {
  setState({ ...state, token })
}

// After creating or joining a company: the new token (with the companyId claim), the user's role in that
// company ("admin" when created, "staff" when joined) and the active company change together.
export function enterCompany({ token, companyId, role }) {
  setState({
    token,
    user: state.user ? { ...state.user, role, companyId } : state.user,
    activeCompanyId: companyId,
  })
}

export function setActiveCompany(companyId) {
  setState({ ...state, activeCompanyId: companyId })
}

export function useAuthStore() {
  return useSyncExternalStore(subscribeAuth, getAuthState, getAuthState)
}
