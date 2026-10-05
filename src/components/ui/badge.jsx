import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

const badgeVariants = {
  muted: styles.badgeMuted,
  success: styles.badgeSuccess,
  warning: styles.badgeWarning,
}

export function Badge({ className, variant = 'muted', ...props }) {
  return (
    <span className={cn(styles.badge, badgeVariants[variant], className)} {...props} />
  )
}
