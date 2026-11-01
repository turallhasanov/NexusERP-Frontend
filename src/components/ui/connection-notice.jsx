import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'
import { useConnectionStore } from '@/store/connection-store'

// Shown on every page (sign-in included) while the API client retries a request that hit a network error.
export function ConnectionNotice() {
  const { pendingRetries } = useConnectionStore()

  if (pendingRetries === 0) {
    return null
  }

  return (
    <div className={styles.toastStack} aria-live="polite">
      <div role="status" className={cn(styles.toast, styles.toastInfo)}>
        <span>Canlı bağlantı bərpa olunur...</span>
      </div>
    </div>
  )
}
