import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

export function Spinner({ className }) {
  return <span role="status" aria-label="Yüklənir" className={cn(styles.spinner, className)} />
}
