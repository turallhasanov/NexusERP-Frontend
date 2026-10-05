import { styles } from '@/lib/styles'

export function PageContainer({ title, description, children }) {
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
