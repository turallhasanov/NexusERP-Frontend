import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'
import { dismissToast, useToastStore } from '@/store/toast-store'

const toastVariants = {
  success: styles.toastSuccess,
  error: styles.toastError,
}

export function Toaster() {
  const { toasts } = useToastStore()

  return (
    <div className={styles.toastStack} aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} role="status" className={cn(styles.toast, toastVariants[toast.variant])}>
          <span>{toast.message}</span>
          <button
            type="button"
            className={styles.toastClose}
            aria-label="Bağla"
            onClick={() => dismissToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
