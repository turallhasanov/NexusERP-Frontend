import { AdminPage } from '@/features/admin/components/AdminUi'
import { fetchSystemInfo } from '@/features/splash/api/fetch-system-info'
import { useApiQuery } from '@/hooks/use-api-query'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'
import { USER_ROLE_LABELS } from '@/types/auth'

function Row({ label, value }) {
  return (
    <div className={styles.adminDlRow}>
      <dt className={styles.adminDt}>{label}</dt>
      <dd className={styles.adminDd}>{value || '—'}</dd>
    </div>
  )
}

export function AdminSettingsPage() {
  const { user } = useAuthStore()
  const system = useApiQuery(fetchSystemInfo)
  useDocumentTitle('Platforma parametrləri')

  return (
    <AdminPage title="Parametrlər" description="Platforma hesabı və tenant idarəetmə qaydaları.">
      <div className={styles.adminSplit}>
        <div className={styles.adminCard}>
          <h2 className={styles.adminCardTitle}>Hesabım</h2>
          <dl className={styles.adminDl}>
            <Row label="Ad Soyad" value={user?.name} />
            <Row label="E-poçt" value={user?.email} />
            <Row label="Rol" value={USER_ROLE_LABELS[user?.role] ?? user?.role} />
          </dl>
        </div>

        <div className={styles.adminCard}>
          <h2 className={styles.adminCardTitle}>Sistem</h2>
          <dl className={styles.adminDl}>
            <Row label="Məhsul" value={system.data?.appName} />
            <Row label="Versiya" value={system.data?.version} />
            <Row label="Mühit" value={system.data?.environment} />
            <Row label="Server" value={system.data ? 'Onlayn' : system.error ? 'Əlçatmaz' : '…'} />
          </dl>
        </div>
      </div>

      <div className={styles.adminCard}>
        <h2 className={styles.adminCardTitle}>Tenant idarəetmə qaydaları</h2>
        <ul className={styles.adminNoteList}>
          <li>
            «Şirkətə keç» şirkətin öz panelini <strong>yalnız baxış rejimində</strong> açır: server bu rejimdə hər
            dəyişikliyi (yaratma, redaktə, silmə) rədd edir.
          </li>
          <li>Baxış rejimi məhdud müddətlidir (standart 60 dəqiqə); vaxt bitəndə avtomatik admin panelə qayıdırsınız.</li>
          <li>
            Şirkət <strong>passiv</strong> və ya <strong>dondurulmuş</strong> ediləndə onun istifadəçiləri növbəti sorğuda
            sistemdən çıxarılır və yenidən daxil ola bilmir. Aktivləşdirmə girişi dərhal bərpa edir.
          </li>
          <li>Yeni şirkət yaradılarkən onun ilk administratoru təsdiqlənmiş hesabla yaradılır.</li>
          <li>Platforma administratoru heç bir şirkətə üzv olmur və qeydiyyatla yaradıla bilməz — server konfiqurasiyasından təyin edilir.</li>
        </ul>
      </div>
    </AdminPage>
  )
}
