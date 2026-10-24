import { useState } from 'react'
import { fetchTenant, fetchTenantSummary } from '@/features/admin/api/admin-api'
import { AdminBadge, AdminChips, AdminError, AdminKpi, AdminLoading, AdminModal } from '@/features/admin/components/AdminUi'
import { TenantStatusControl } from '@/features/admin/components/TenantStatusControl'
import { ACTIVITY_LABELS, DOCUMENT_STATUS_LABELS } from '@/features/admin/lib/tenant-status'
import { useApiQuery } from '@/hooks/use-api-query'
import { formatDate, fromApiDate } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { profitTone } from '@/lib/profit'
import { presetRange, RANGE_ALL, RANGE_PRESETS, toApiRange } from '@/lib/report-range'
import { styles } from '@/lib/styles'
import { USER_ROLE_LABELS } from '@/types/auth'

const COUNT_LABELS = [
  ['products', 'Məhsul'],
  ['warehouses', 'Depo'],
  ['stores', 'Mağaza'],
  ['customers', 'Kontragent'],
  ['sales', 'Satış'],
  ['purchases', 'Alış'],
  ['expenses', 'Xərc'],
]

// Everything the platform knows about one company: its figures for a period, record counts, users and
// latest documents, plus the status control and the switch into its read-only view.
export function TenantDetailsModal({ tenantId, onClose, onChanged, onSwitch, switching }) {
  const [rangeId, setRangeId] = useState(RANGE_ALL)
  const details = useApiQuery(fetchTenant, { id: tenantId })
  const summary = useApiQuery(fetchTenantSummary, { id: tenantId, ...toApiRange(presetRange(rangeId)) })
  const tenant = details.data
  const figures = summary.data
  const money = (amount) => (figures ? formatAzn(amount) : null)

  function handleStatusChanged(updated) {
    details.reload()
    onChanged?.(updated)
  }

  return (
    <AdminModal
      title={tenant?.name ?? 'Şirkət'}
      labelId="tenant-details-title"
      onClose={onClose}
      header={
        tenant ? (
          <div className={styles.adminModalMeta}>
            <span>VÖEN: {tenant.voen || '—'}</span>
            <span>Yaradılıb: {formatDate(fromApiDate(tenant.createdAt))}</span>
            <span>
              Dəvət kodu: <span className={styles.adminMono}>{tenant.inviteCode}</span>
            </span>
            <TenantStatusControl tenant={tenant} onChanged={handleStatusChanged} />
          </div>
        ) : null
      }
    >
      {details.error ? <AdminError message={details.error} onRetry={details.reload} /> : null}
      {!tenant && details.isLoading ? <AdminLoading /> : null}

      {tenant ? (
        <>
          <div className={styles.adminSectionHeader}>
            <h3 className={styles.adminSectionTitle}>Maliyyə göstəriciləri</h3>
            <AdminChips label="Dövr" options={RANGE_PRESETS} value={rangeId} onChange={setRangeId} />
          </div>
          {summary.error ? <AdminError message={summary.error} onRetry={summary.reload} /> : null}
          <div className={styles.adminKpiGrid}>
            <AdminKpi label="Ümumi gəlir" value={money(figures?.totalSales)} hint="Təsdiqlənmiş satışlar" isLoading={summary.isLoading} />
            <AdminKpi
              label="Xalis mənfəət"
              value={money(figures?.netProfit)}
              tone={figures ? profitTone(figures.netProfit) : 'default'}
              hint={figures ? `Xərclər: ${formatAzn(figures.totalExpenses)}` : undefined}
              isLoading={summary.isLoading}
            />
            <AdminKpi label="Alış (təsdiqlənmiş)" value={money(figures?.totalPurchases)} isLoading={summary.isLoading} />
            <AdminKpi
              label="Kritik ehtiyat"
              value={figures ? String(figures.lowStockProductsCount) : null}
              tone={figures?.lowStockProductsCount > 0 ? 'warning' : 'default'}
              hint={figures ? `${figures.totalProducts} aktiv məhsuldan` : undefined}
              isLoading={summary.isLoading}
            />
          </div>

          <div className={styles.adminCountGrid}>
            {COUNT_LABELS.map(([key, label]) => (
              <div key={key} className={styles.adminCount}>
                <p className={styles.adminCountValue}>{tenant.counts[key]}</p>
                <p className={styles.adminCountLabel}>{label}</p>
              </div>
            ))}
          </div>

          <div className={styles.adminSplit}>
            <div className={styles.adminCard}>
              <h3 className={styles.adminCardTitle}>İstifadəçilər ({tenant.users.length})</h3>
              {tenant.users.length === 0 ? (
                <p className={styles.adminEmpty}>Bu şirkətin istifadəçisi yoxdur.</p>
              ) : (
                <ul className={styles.adminList}>
                  {tenant.users.map((user) => (
                    <li key={user.id} className={styles.adminListRow}>
                      <div className={styles.adminListMain}>
                        <p className={styles.adminListTitle}>{user.name}</p>
                        <p className={styles.adminListMeta}>
                          {user.email} · {formatDate(fromApiDate(user.createdAt))}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                        <AdminBadge tone={user.role === 'admin' ? 'success' : 'muted'}>
                          {USER_ROLE_LABELS[user.role] ?? user.role}
                        </AdminBadge>
                        {!user.isActive ? <AdminBadge tone="danger">Deaktiv</AdminBadge> : null}
                        {!user.isEmailConfirmed ? <AdminBadge tone="warning">Təsdiqlənməyib</AdminBadge> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.adminCard}>
              <h3 className={styles.adminCardTitle}>Son əməliyyatlar</h3>
              {tenant.activity.length === 0 ? (
                <p className={styles.adminEmpty}>Hələ əməliyyat yoxdur.</p>
              ) : (
                <ul className={styles.adminList}>
                  {tenant.activity.map((item, index) => (
                    <li key={`${item.type}-${item.title}-${index}`} className={styles.adminListRow}>
                      <div className={styles.adminListMain}>
                        <p className={styles.adminListTitle}>
                          {ACTIVITY_LABELS[item.type]} · {item.title}
                        </p>
                        <p className={styles.adminListMeta}>
                          {formatDate(fromApiDate(item.date))}
                          {item.status ? ` · ${DOCUMENT_STATUS_LABELS[item.status]}` : ''}
                        </p>
                      </div>
                      <span className={styles.adminListValue}>{formatAzn(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <footer className={styles.adminModalActions}>
            <button type="button" className={styles.adminButtonGhost} onClick={onClose}>
              Bağla
            </button>
            <button type="button" className={styles.adminButtonPrimary} disabled={switching} onClick={() => onSwitch(tenant.id)}>
              {switching ? 'Açılır…' : 'Şirkətə keç (baxış rejimi)'}
            </button>
          </footer>
        </>
      ) : null}
    </AdminModal>
  )
}
