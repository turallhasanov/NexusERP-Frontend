import { useSyncExternalStore } from 'react'
import { isTokenExpired } from '@/lib/jwt'
import { clearCompany, setCompany } from '@/store/company-store'

const STORAGE_KEY = 'nexuserp-auth'

const EMPTY_STATE = {
  token: null,
  user: null,
  activeCompanyId: null,
  // Set while a platform admin views a company: { adminToken, adminUser, company, expiresAt }.
  // `token` is then the read-only impersonation token; the admin's own session waits here.
  impersonation: null,
}

// The admin's session from before an impersonation, or a logged-out state if that has expired too.
function adminSession(impersonation) {
  if (!impersonation?.adminToken || isTokenExpired(impersonation.adminToken)) {
    return EMPTY_STATE
  }

  return { ...EMPTY_STATE, token: impersonation.adminToken, user: impersonation.adminUser ?? null }
}

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return EMPTY_STATE
    }

    const parsed = JSON.parse(raw)

    // An expired company view falls back to the admin's own session, if that is still valid.
    if (parsed?.impersonation && (!parsed.token || isTokenExpired(parsed.token))) {
      const session = adminSession(parsed.impersonation)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      return session
    }

    // An expired token would only earn a 401 on the first request; start logged out instead.
    if (!parsed?.token || isTokenExpired(parsed.token)) {
      localStorage.removeItem(STORAGE_KEY)
      return EMPTY_STATE
    }

    return {
      token: parsed.token,
      user: parsed.user ?? null,
      activeCompanyId: parsed.activeCompanyId ?? null,
      impersonation: parsed.impersonation ?? null,
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

// Platform admin → read-only view of one company, from POST /api/admin/tenants/{id}/impersonate.
// The app then behaves as that company's admin would see it; the server rejects every write.
export function startImpersonation({ token, company, expiresAt }) {
  const current = state.impersonation
  const adminToken = current ? current.adminToken : state.token
  const adminUser = current ? current.adminUser : state.user

  setState({
    token,
    user: adminUser ? { ...adminUser, role: 'admin', companyId: company.id } : null,
    activeCompanyId: company.id,
    impersonation: { adminToken, adminUser, company, expiresAt },
  })
  setCompany(company)
}

// Back to the admin's own session (or logged out, if it has expired meanwhile).
export function stopImpersonation() {
  setState(adminSession(state.impersonation))
  clearCompany()
}

export function useAuthStore() {
  return useSyncExternalStore(subscribeAuth, getAuthState, getAuthState)
}
