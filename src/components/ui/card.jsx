import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

export function Card({ className, padded = true, ...props }) {
  return (
    <div
      className={cn(padded ? styles.card : styles.cardFlush, className)}
      {...props}
    />
  )
}
