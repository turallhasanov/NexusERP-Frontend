import { styles } from '@/lib/styles'

export function PageContainer({ title, description, action, children }) {
  return (
    <section className={styles.page}>
      <header className={action ? styles.pageHeader : undefined}>
        <div>
          <h1 className={styles.pageTitle}>{title}</h1>
          {description ? <p className={styles.pageDescription}>{description}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
