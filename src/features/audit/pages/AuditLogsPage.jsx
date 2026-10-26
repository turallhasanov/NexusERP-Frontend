import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { AdminBadge, AdminError, AdminLoading } from '@/features/admin/components/AdminUi'
import { fetchAuditLogs } from '@/features/audit/api/audit-api'
import { useApiQuery } from '@/hooks/use-api-query'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { cn } from '@/lib/cn'
import { fromApiDate } from '@/lib/date'
import { styles } from '@/lib/styles'
import { USER_ROLE_LABELS } from '@/types/auth'

const DEPARTMENTS = ['Maliyyə', 'İHR', 'Anbar', 'Şəbəkə']

const ACTIONS = {
  create: { label: 'Əlavə etmə', tone: 'success' },
  update: { label: 'Dəyişiklik', tone: 'caution' },
  delete: { label: 'Silmə', tone: 'danger' },
}

const MODULES = {
  finance: 'Maliyyə',
  hr: 'İHR',
  inventory: 'Anbar',
  retail: 'Şəbəkə (mağaza, satış)',
}

const EMPTY_FILTERS = { department: '', actionType: '', startDate: '', endDate: '' }

function formatDateTime(value) {
  const date = new Date(fromApiDate(value))
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// "admin · Maliyyəçi" → "İdarəçi · Maliyyəçi"
function roleLabel(userRole) {
  const [role, ...jobRole] = userRole.split(' · ')
  return [USER_ROLE_LABELS[role] ?? role, ...jobRole].join(' · ')
}

// The company's audit trail (IT admins only): who created, changed or deleted what, filterable by department,
// action type and dates.
export function AuditLogsPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const logs = useApiQuery(fetchAuditLogs, { ...filters, page })
  useDocumentTitle('Sistem Logları / Audit')

  const items = logs.data?.items ?? []
  const total = logs.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / (logs.data?.pageSize ?? 50)))
  const input = cn(styles.adminInput, styles.adminDateInput)

  function updateFilter(field) {
    return (event) => {
      setFilters((current) => ({ ...current, [field]: event.target.value }))
      setPage(1)
    }
  }

  return (
    <PageContainer
      title="Sistem Logları / Audit"
      description="Şirkətdə edilən kritik əməliyyatların tarixçəsi: kim, nə vaxt, nəyi əlavə etdi, dəyişdi və ya sildi."
    >
      <section className={styles.auditPanel} data-surface="glass">
        <div className={styles.auditFilters}>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Departament</span>
            <select className={input} value={filters.department} onChange={updateFilter('department')}>
              <option value="">Bütün departamentlər</option>
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Əməliyyat növü</span>
            <select className={input} value={filters.actionType} onChange={updateFilter('actionType')}>
              <option value="">Bütün əməliyyatlar</option>
              {Object.entries(ACTIONS).map(([id, action]) => (
                <option key={id} value={id}>
                  {action.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Başlanğıc tarixi</span>
            <input type="date" className={input} value={filters.startDate} onChange={updateFilter('startDate')} />
          </label>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Son tarix</span>
            <input
              type="date"
              className={input}
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={updateFilter('endDate')}
            />
          </label>
          <button
            type="button"
            className={cn(styles.adminButtonGhost, 'self-end')}
            onClick={() => {
              setFilters(EMPTY_FILTERS)
              setPage(1)
            }}
          >
            Sıfırla
          </button>
        </div>

        {logs.error && !logs.data ? <AdminError message={logs.error} onRetry={logs.reload} /> : null}

        <div className={styles.adminTableWrap}>
          <table className={styles.adminTable}>
            <thead className={styles.adminTableHead}>
              <tr>
                <th className={styles.adminTh}>Tarix / vaxt</th>
                <th className={styles.adminTh}>İstifadəçi (rol / dep.)</th>
                <th className={styles.adminTh}>Modul</th>
                <th className={styles.adminTh}>Əməliyyat</th>
                <th className={styles.adminTh}>Təfərrüat</th>
              </tr>
            </thead>
            <tbody>
              {!logs.data && logs.isLoading ? (
                <tr>
                  <td colSpan={5}>
                    <AdminLoading />
                  </td>
                </tr>
              ) : null}
              {logs.data && items.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.adminTableState}>
                    Seçilmiş filtrlərə uyğun qeyd yoxdur.
                  </td>
                </tr>
              ) : null}
              {items.map((log) => {
                const action = ACTIONS[log.actionType] ?? ACTIONS.update

                return (
                  <tr key={log.id} className={styles.adminTr}>
                    <td className={cn(styles.adminTdMuted, 'whitespace-nowrap tabular-nums')}>{formatDateTime(log.createdAt)}</td>
                    <td className={styles.adminTd}>
                      <span className="block text-slate-100">{log.userName}</span>
                      <span className="block text-xs text-slate-400">
                        {roleLabel(log.userRole)} · {log.department}
                      </span>
                      {log.ipAddress ? <span className="block text-[11px] text-slate-500">IP {log.ipAddress}</span> : null}
                    </td>
                    <td className={styles.adminTdMuted}>{MODULES[log.moduleName] ?? log.moduleName}</td>
                    <td className={styles.adminTd}>
                      <AdminBadge tone={action.tone}>{action.label}</AdminBadge>
                    </td>
                    <td className={styles.adminTd}>{log.description}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.auditPager}>
          <span>{logs.data ? `${total} qeyd · səhifə ${logs.data.page} / ${pageCount}` : ''}</span>
          <div className="flex gap-2">
            <button
              type="button"
              className={styles.adminButtonSmall}
              onClick={() => setPage((current) => current - 1)}
              disabled={page <= 1 || logs.isLoading}
            >
              ← Əvvəlki
            </button>
            <button
              type="button"
              className={styles.adminButtonSmall}
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= pageCount || logs.isLoading}
            >
              Növbəti →
            </button>
          </div>
        </div>
      </section>
    </PageContainer>
  )
}
