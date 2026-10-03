import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn.ts'
import { styles } from '@/lib/styles.ts'

type BadgeVariant = 'muted' | 'success' | 'warning'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

const badgeVariants: Record<BadgeVariant, string> = {
  muted: styles.badgeMuted,
  success: styles.badgeSuccess,
  warning: styles.badgeWarning,
}

export function Badge({ className, variant = 'muted', ...props }: BadgeProps) {
  return (
    <span className={cn(styles.badge, badgeVariants[variant], className)} {...props} />
  )
}
