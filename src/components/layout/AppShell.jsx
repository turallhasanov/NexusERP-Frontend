import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { styles } from '@/lib/styles'

export function AppShell() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.contentColumn}>
        <Header />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
