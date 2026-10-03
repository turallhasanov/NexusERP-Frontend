import type { ReactNode } from 'react'
import { styles } from '@/lib/styles.ts'

type PageContainerProps = {
  title: string
  description?: string
  children?: ReactNode
}

export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <section className={styles.page}>
      <header>
        <h1 className={styles.pageTitle}>{title}</h1>
        {description ? <p className={styles.pageDescription}>{description}</p> : null}
      </header>
      {children}
    </section>
  )
}
