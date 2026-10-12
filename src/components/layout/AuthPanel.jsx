import { BrandLockup } from '@/components/brand/BrandLockup'
import { Card } from '@/components/ui/card'
import { styles } from '@/lib/styles'

// Centered brand + card used by the login, registration, verification and password pages.
export function AuthPanel({ title, description, children }) {
  return (
    <div className={styles.loginPanel}>
      <div className={styles.loginBrand}>
        <BrandLockup align="center" />
      </div>
      <Card>
        <div className={styles.page}>
          <header>
            <h1 className={styles.pageTitle}>{title}</h1>
            {description ? <p className={styles.pageDescription}>{description}</p> : null}
          </header>
          {children}
        </div>
      </Card>
    </div>
  )
}
