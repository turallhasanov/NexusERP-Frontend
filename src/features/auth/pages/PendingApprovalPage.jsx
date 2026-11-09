import { useCallback, useEffect, useState } from 'react'
import { AuthPanel } from '@/components/layout/AuthPanel'
import { Button } from '@/components/ui/button'
import { fetchMe } from '@/features/auth/api/fetch-me'
import { signOut } from '@/features/auth/api/sign-out'
import { GlassBackdrop } from '@/components/layout/GlassBackdrop'
import { styles } from '@/lib/styles'
import { updateUser, useAuthStore } from '@/store/auth-store'

const RECHECK_INTERVAL_MS = 20000

// Shown instead of the whole app (no menu, no module) to a user who joined a company and is waiting for its IT admin
// to approve the account and give a role. Rechecks the account now and then, so approval opens the app by itself.
export function PendingApprovalPage() {
  const { user } = useAuthStore()
  const [checking, setChecking] = useState(false)
  const [stillPending, setStillPending] = useState(false)

  const recheck = useCallback(async () => {
    setChecking(true)

    try {
      const fresh = await fetchMe()
      updateUser(fresh)
      setStillPending(fresh.isApproved === false)
    } catch {
      // Offline or signed out: the api client already handles 401; keep showing the notice.
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(recheck, RECHECK_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [recheck])

  return (
    <div className={styles.authScreen} data-surface="glass">
      <GlassBackdrop />
      <div className={styles.authContent}>
        <AuthPanel title="Giriş məhdudlaşdırıldı" description="Giriş səlahiyyəti yoxdur">
          <div role="alert" className="space-y-3">
            <p className={styles.pageDescription}>
              Hesabınız hələ təsdiqlənməyib. Səlahiyyət və rol təyini üçün İT / Sistem administratoru ilə əlaqə saxlayın.
            </p>
            {user?.email ? <p className={styles.fieldHint}>Hesab: {user.email}</p> : null}
            {stillPending ? <p className={styles.fieldHint}>Hesab hələ də təsdiq gözləyir.</p> : null}
          </div>
          <div className={styles.authActions}>
            <Button className="flex-1" onClick={recheck} disabled={checking}>
              {checking ? 'Yoxlanılır…' : 'Yenidən yoxla'}
            </Button>
            <Button variant="outline" className="flex-1" onClick={signOut}>
              Çıxış
            </Button>
          </div>
        </AuthPanel>
      </div>
    </div>
  )
}
