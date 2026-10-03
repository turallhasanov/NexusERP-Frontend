import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn.ts'
import { styles } from '@/lib/styles.ts'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean
}

export function Card({ className, padded = true, ...props }: CardProps) {
  return (
    <div
      className={cn(padded ? styles.card : styles.cardFlush, className)}
      {...props}
    />
  )
}
