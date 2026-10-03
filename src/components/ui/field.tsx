import type { ReactNode } from 'react'
import { styles } from '@/lib/styles.ts'

type FieldProps = {
  label: string
  children: ReactNode
}

export function Field({ label, children }: FieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  )
}
