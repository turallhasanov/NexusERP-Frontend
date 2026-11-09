import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useStorefront } from '@/features/company/api/use-company'
import { fetchMyCompany } from '@/features/company/api/join-company'
import { resetStock } from '@/features/settings/api/reset-stock'
import { syncAllData } from '@/features/settings/api/sync-all-data'
import { ResetStockModal } from '@/features/settings/components/ResetStockModal'
import { CompanyUsersTable } from '@/features/settings/components/CompanyUsersTable'
import { useApiQuery } from '@/hooks/use-api-query'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'
import { showToast } from '@/store/toast-store'
import { USER_ROLE_LABELS, isCompanyManager } from '@/types/auth'

export function SettingsPage() {
  const { user } = useAuthStore()
  const company = useApiQuery(fetchMyCompany)
  const storefront = useStorefront()
  const [copied, setCopied] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [resetting, setResetting] = useState(false)
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

  async function runDataIntegration() {
    setSyncing(true)
    try {
      const result = await syncAllData()
      showToast(
        result.skipped > 0
          ? `Məhsullar inteqrasiya olundu, ${result.skipped} variant keçildi.`
          : 'Bütün məhsullar və stok parametrləri NexusERP-yə uğurla inteqrasiya olundu',
      )
    } catch (error) {
      showToast(error.message || 'Data inteqrasiyası alınmadı.', 'error')
    } finally {
      setSyncing(false)
    }
  }

  async function runStockReset() {
    setResetting(true)
    try {
      await resetStock()
      showToast('Bütün məhsulların stok qalığı uğurla sıfırlandı')
      setConfirmingReset(false)
    } catch (error) {
      showToast(error.message || 'Stok qalığını sıfırlamaq alınmadı.', 'error')
    } finally {
      setResetting(false)
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
      {isCompanyManager(user) ? (
        <section className="space-y-4">
          <h2 className={styles.sectionTitle}>Data inteqrasiyası</h2>
          <Card>
            {storefront.enabled ? (
            <div className={styles.inviteRow}>
              <div>
                <p className={styles.summaryHint}>
                  {storefront.name} kataloqundakı bütün məhsulları, variantları (ölçü/rəng), qiymətləri və stoku NexusERP-yə
                  köçürür və ya yeniləyir. Mövcud məhsulların stoku {storefront.name}-dakı qalığa bərabərləşdirilir.
                </p>
              </div>
              <Button onClick={runDataIntegration} disabled={syncing} aria-busy={syncing}>
                {syncing ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner />
                    İnteqrasiya olunur...
                  </span>
                ) : (
                  'Data Inteqrasiyası'
                )}
              </Button>
            </div>
            ) : null}
            <div className={`${styles.inviteRow} ${storefront.enabled ? 'mt-4 border-t border-neutral-200 pt-4' : ''}`}>
              <p className={styles.summaryHint}>
                Bütün anbarlardakı stok qalıqlarını 0 edir. Məhsullar və sənədlər silinmir. Geri qaytarıla bilməz.
              </p>
              <Button variant="outline" onClick={() => setConfirmingReset(true)} disabled={resetting}>
                Stok Qalığını Sil
              </Button>
            </div>
          </Card>
          {confirmingReset ? (
            <ResetStockModal resetting={resetting} onConfirm={runStockReset} onClose={() => setConfirmingReset(false)} />
          ) : null}
        </section>
      ) : null}
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
