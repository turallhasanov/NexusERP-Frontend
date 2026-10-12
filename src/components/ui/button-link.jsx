import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

const buttonVariants = {
  primary: styles.buttonPrimary,
  outline: styles.buttonOutline,
}

// Navigation that looks like a Button. Stays a real link, so middle-click and "open in new tab" work.
export function ButtonLink({ className, variant = 'primary', ...props }) {
  return <Link className={cn(buttonVariants[variant], className)} {...props} />
}
