import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

export function Button({ className, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cn(styles.buttonPrimary, className)}
      {...props}
    />
  )
}
