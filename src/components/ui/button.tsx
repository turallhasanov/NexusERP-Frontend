import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn.ts'

type ButtonVariant = 'default' | 'outline'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  outline: 'border border-border bg-background hover:bg-muted',
}

export function Button({
  className,
  variant = 'default',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-8 items-center justify-center rounded-sm px-3 text-sm font-medium',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
