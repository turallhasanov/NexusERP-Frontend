const STORAGE_KEY = 'nexuserp-splash-seen'

// The splash plays once per browser tab session; later trips to /login (sign-out, expired token) skip it.
export function hasSeenSplash() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return true
  }
}

export function markSplashSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // Storage blocked (private mode): the splash simply shows again next time.
  }
}
