import { Spinner } from '@/components/ui/spinner'
import { styles } from '@/lib/styles'

// Shown inside a shell while a lazily loaded page's code downloads (see lazyPage in App.jsx).
export function RouteFallback() {
  return (
    <div className={styles.loadingRow}>
      <Spinner />
      Yüklənir…
    </div>
  )
}
