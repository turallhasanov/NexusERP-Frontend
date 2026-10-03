import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn.ts'
import { styles } from '@/lib/styles.ts'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(styles.buttonPrimary, className)}
      {...props}
    />
  )
}
