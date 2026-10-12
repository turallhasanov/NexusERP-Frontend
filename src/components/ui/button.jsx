import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

const buttonVariants = {
  primary: styles.buttonPrimary,
  outline: styles.buttonOutline,
}

export function Button({ className, type = 'button', variant = 'primary', ...props }) {
  return (
    <button
      type={type}
      className={cn(buttonVariants[variant], className)}
      {...props}
    />
  )
}
