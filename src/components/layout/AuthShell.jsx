import { Outlet } from 'react-router-dom'
import { GlassBackdrop } from '@/components/layout/GlassBackdrop'
import { styles } from '@/lib/styles'

// Sign-in, sign-up, password and company onboarding pages, on the same dark glass surface as the splash.
export function AuthShell() {
  return (
    <div className={styles.authScreen} data-surface="glass">
      <GlassBackdrop />
      <div className={styles.authContent}>
        <Outlet />
      </div>
    </div>
  )
}
