import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

export function Input({ className, ...props }) {
  return <input className={cn(styles.input, className)} {...props} />
}
