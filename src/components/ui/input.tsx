import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn.ts'
import { styles } from '@/lib/styles.ts'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(styles.input, className)} {...props} />
}
