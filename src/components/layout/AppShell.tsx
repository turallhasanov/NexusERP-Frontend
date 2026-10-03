import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header.tsx'
import { Sidebar } from '@/components/layout/Sidebar.tsx'
import { styles } from '@/lib/styles.ts'

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
