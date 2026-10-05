import { Outlet } from 'react-router-dom'
import { styles } from '@/lib/styles'

export function AuthShell() {
  return (
    <div className={styles.loginScreen}>
      <Outlet />
    </div>
  )
}
