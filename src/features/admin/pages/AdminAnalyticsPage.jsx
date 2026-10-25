import { fetchPlatformAnalytics } from '@/features/admin/api/admin-api'
import { AdminBadge, AdminError, AdminKpi, AdminPage } from '@/features/admin/components/AdminUi'
import { TENANT_ACTIVE, TENANT_PASSIVE, TENANT_SUSPENDED, tenantStatus } from '@/features/admin/lib/tenant-status'
import { useApiQuery } from '@/hooks/use-api-query'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { cn } from '@/lib/cn'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const HEALTH = {
  healthy: { label: 'Sağlam', dot: styles.adminHealthOk, tone: 'positive' },
  slow: { label: 'Yavaş', dot: styles.adminHealthSlow, tone: 'warning' },
}

const STATUS_BARS = [
  { id: TENANT_ACTIVE, key: 'activeTenants', fill: styles.adminBarFill },
  { id: TENANT_PASSIVE, key: 'passiveTenants', fill: styles.adminBarFillWarning },
  { id: TENANT_SUSPENDED, key: 'suspendedTenants', fill: styles.adminBarFillDanger },
]

function percent(part, total) {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

export function AdminAnalyticsPage() {
  const analytics = useApiQuery(fetchPlatformAnalytics)
  const data = analytics.data
  // The endpoint only answers when the database does, so a failed load means the system is not healthy.
  const health = data ? HEALTH[data.health.status] ?? HEALTH.slow : null
  const topRevenue = data?.topTenants[0]?.revenue ?? 0
  useDocumentTitle('Analitika')

  return (
    <AdminPage
      title="Sistem analitikası"
      description="Bütün şirkətlər üzrə ümumi göstəricilər."
      action={
        <button type="button" className={styles.adminButtonGhost} disabled={analytics.isLoading} onClick={analytics.reload}>
          {analytics.isLoading ? 'Yenilənir…' : 'Yenilə'}
        </button>
      }
    >
      {analytics.error ? <AdminError message={analytics.error} onRetry={analytics.reload} /> : null}

      <div className={styles.adminKpiGrid}>
        <AdminKpi
          label="Ümumi dövriyyə"
          value={data ? formatAzn(data.totalRevenue) : null}
          hint={data ? `Son 30 gün: ${formatAzn(data.revenueLast30Days)}` : 'Təsdiqlənmiş satışlar'}
          isLoading={analytics.isLoading}
        />
        <AdminKpi
          label="Aktiv şirkət"
          value={data ? `${data.activeTenants} / ${data.totalTenants}` : null}
          tone="positive"
          hint={data ? `Son 30 gündə yeni: ${data.newTenantsLast30Days}` : undefined}
          isLoading={analytics.isLoading}
        />
        <AdminKpi
          label="İstifadəçilər"
          value={data ? String(data.totalUsers) : null}
          hint="Şirkətlərə bağlı hesablar"
          isLoading={analytics.isLoading}
        />
        <AdminKpi
          label="Sistem sağlamlığı"
          value={health ? health.label : analytics.error ? 'Əlçatmaz' : null}
          tone={health ? health.tone : analytics.error ? 'negative' : 'default'}
          hint={data ? `Verilənlər bazası: ${data.health.databaseLatencyMs} ms` : undefined}
          isLoading={analytics.isLoading}
        />
      </div>

      {data ? (
        <div className={styles.adminSplit}>
          <div className={styles.adminCard}>
            <h2 className={styles.adminCardTitle}>Şirkətlər statusa görə</h2>
            <ul className="space-y-4">
              {STATUS_BARS.map((bar) => {
                const count = data[bar.key]
                const share = percent(count, data.totalTenants)

                return (
                  <li key={bar.id} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{tenantStatus(bar.id).label}</span>
                      <span className="tabular-nums text-slate-400">
                        {count} · {share}%
                      </span>
                    </div>
                    <div className={styles.adminBar}>
                      <div className={bar.fill} style={{ width: `${share}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className={cn(styles.adminKpiHint, 'mt-5 flex items-center gap-2')}>
              <span className={cn(styles.adminHealthDot, health.dot)} />
              Yoxlanılıb: {new Date(data.health.checkedAt).toLocaleTimeString('az-AZ')}
            </p>
          </div>

          <div className={styles.adminCard}>
            <h2 className={styles.adminCardTitle}>Ən yüksək dövriyyəli şirkətlər</h2>
            {data.topTenants.length === 0 ? (
              <p className={styles.adminEmpty}>Hələ şirkət yoxdur.</p>
            ) : (
              <ul className="space-y-4">
                {data.topTenants.map((tenant) => {
                  const status = tenantStatus(tenant.status)

                  return (
                    <li key={tenant.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-slate-200">{tenant.name}</span>
                          {tenant.status !== TENANT_ACTIVE ? <AdminBadge tone={status.tone}>{status.label}</AdminBadge> : null}
                        </span>
                        <span className="shrink-0 tabular-nums text-slate-300">{formatAzn(tenant.revenue)}</span>
                      </div>
                      <div className={styles.adminBar}>
                        <div className={styles.adminBarFill} style={{ width: `${percent(tenant.revenue, topRevenue)}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </AdminPage>
  )
}
