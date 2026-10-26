import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { fetchMyCompany } from '@/features/company/api/join-company'
import { CompanyUsersTable } from '@/features/settings/components/CompanyUsersTable'
import { useApiQuery } from '@/hooks/use-api-query'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'
import { showToast } from '@/store/toast-store'
import { USER_ROLE_LABELS } from '@/types/auth'

export function SettingsPage() {
  const { user } = useAuthStore()
  const company = useApiQuery(fetchMyCompany)
  const [copied, setCopied] = useState(false)
  useDocumentTitle('Parametrlər')

  async function copyInviteCode() {
    try {
      await navigator.clipboard.writeText(company.data.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      showToast('Dəvət kodu kopyalandı.')
    } catch {
      showToast('Kopyalamaq alınmadı. Kodu əl ilə seçib kopyalayın.', 'error')
    }
  }

  return (
    <PageContainer title="Parametrlər" description="Şirkət profili, əməkdaşların dəvəti və rolları.">
      <section className="space-y-4">
        <h2 className={styles.sectionTitle}>Şirkət profili</h2>
        <Card>
          {company.isLoading && !company.data ? (
            <div className={styles.loadingRow}>
              <Spinner />
              Yüklənir…
            </div>
          ) : company.error ? (
            <div className={styles.errorRow}>
              <span>{company.error}</span>
              <button type="button" className={styles.textAction} onClick={company.reload}>
                Yenidən cəhd et
              </button>
            </div>
          ) : (
            <dl className={styles.definitionList}>
              <div className={styles.definitionRow}>
                <dt>Şirkət</dt>
                <dd className={styles.definitionValue}>{company.data.name}</dd>
              </div>
              <div className={styles.definitionRow}>
                <dt>VÖEN</dt>
                <dd className={styles.definitionValue}>{company.data.voen || '—'}</dd>
              </div>
              <div className={styles.definitionRow}>
                <dt>İstifadəçi sayı</dt>
                <dd className={styles.definitionValue}>{company.data.memberCount}</dd>
              </div>
            </dl>
          )}
        </Card>
      </section>
      {company.data ? (
        <section className="space-y-4">
          <h2 className={styles.sectionTitle}>Dəvət kodu</h2>
          <Card>
            <div className={styles.inviteRow}>
              <div>
                <p className={styles.inviteCode} aria-label="Dəvət kodu">
                  {company.data.inviteCode}
                </p>
                <p className={styles.summaryHint}>
                  Əməkdaşlar qeydiyyatdan sonra «Mövcud Şirkətə Qoşulun» seçib bu kodu daxil edir.
                </p>
              </div>
              <Button variant="outline" onClick={copyInviteCode}>
                {copied ? 'Kopyalandı ✓' : 'Kopyala'}
              </Button>
            </div>
          </Card>
        </section>
      ) : null}
      {company.data ? (
        <section className="space-y-4">
          <h2 className={styles.sectionTitle}>İstifadəçilər və rollar</h2>
          <CompanyUsersTable />
        </section>
      ) : null}
      <section className="space-y-4">
        <h2 className={styles.sectionTitle}>Hesabım</h2>
        <Card>
          <dl className={styles.definitionList}>
            <div className={styles.definitionRow}>
              <dt>Ad Soyad</dt>
              <dd className={styles.definitionValue}>{user?.name}</dd>
            </div>
            <div className={styles.definitionRow}>
              <dt>E-poçt</dt>
              <dd className={styles.definitionValue}>{user?.email ?? '—'}</dd>
            </div>
            <div className={styles.definitionRow}>
              <dt>Rol</dt>
              <dd className={styles.definitionValue}>{USER_ROLE_LABELS[user?.role] ?? user?.role}</dd>
            </div>
          </dl>
        </Card>
      </section>
    </PageContainer>
  )
}
