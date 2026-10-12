// Reads the payload of a JWT without verifying it. Only for routing decisions on the client
// (expiry, companyId); the server verifies every token it receives.
export function readTokenClaims(token) {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))

    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

export function isTokenExpired(token) {
  const claims = readTokenClaims(token)

  if (!claims) {
    return true
  }

  return typeof claims.exp === 'number' && claims.exp * 1000 <= Date.now()
}
