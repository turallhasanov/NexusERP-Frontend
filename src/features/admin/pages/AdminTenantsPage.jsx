import { useState } from 'react'
import { fetchTenants } from '@/features/admin/api/admin-api'
import { useSwitchToTenant } from '@/features/admin/api/use-switch-to-tenant'
import { AdminChips, AdminError, AdminKpi, AdminPage } from '@/features/admin/components/AdminUi'
import { CreateTenantModal } from '@/features/admin/components/CreateTenantModal'
import { CreateTenantUserModal } from '@/features/admin/components/CreateTenantUserModal'
import { DeleteTenantModal } from '@/features/admin/components/DeleteTenantModal'
import { TenantDetailsModal } from '@/features/admin/components/TenantDetailsModal'
import { TenantStatusControl } from '@/features/admin/components/TenantStatusControl'
import { TENANT_ACTIVE, TENANT_PASSIVE, TENANT_STATUSES, TENANT_SUSPENDED } from '@/features/admin/lib/tenant-status'
import { useApiQuery } from '@/hooks/use-api-query'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatDate, fromApiDate } from '@/lib/date'
import { styles } from '@/lib/styles'
import { showToast } from '@/store/toast-store'

const ALL = 'all'

// 8-character invite codes read more easily in two halves (ABCD-EFGH); joining ignores the dash.
function formatInviteCode(code) {
  return code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code
}

async function copyInviteCode(code) {
  try {
    await navigator.clipboard.writeText(code)
    showToast('Dəvət kodu kopyalandı!')
  } catch {
    showToast('Kopyalamaq alınmadı. Kodu əl ilə seçib kopyalayın.', 'error')
  }
}

function matches(tenant, query) {
  if (!query) {
    return true
  }

  const needle = query.toLocaleLowerCase('az')
  return tenant.name.toLocaleLowerCase('az').includes(needle) || (tenant.voen ?? '').includes(needle)
}

export function AdminTenantsPage() {
  const tenants = useApiQuery(fetchTenants)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(ALL)
  const [selectedId, setSelectedId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [addingUserTo, setAddingUserTo] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const { switchTo, pendingId } = useSwitchToTenant()
  useDocumentTitle('Şirkətlər')

  const all = tenants.data ?? []
  const countOf = (status) => all.filter((tenant) => tenant.status === status).length
  const rows = all.filter((tenant) => (statusFilter === ALL || tenant.status === statusFilter) && matches(tenant, query.trim()))
  const loaded = tenants.data !== null
  const filters = [
    { id: ALL, label: `Hamısı (${all.length})` },
    ...TENANT_STATUSES.map((status) => ({ id: status.id, label: `${status.label} (${countOf(status.id)})` })),
  ]

  function handleCreated({ tenant }) {
    setCreating(false)
    tenants.reload()
    showToast(`«${tenant.name}» yaradıldı. Administrator indi daxil ola bilər.`)
  }

  function handleUserCreated(user) {
    const tenantName = addingUserTo.name
    setAddingUserTo(null)
    tenants.reload()
    showToast(`${user.name} «${tenantName}» şirkətinə əlavə edildi. İstifadəçi indi daxil ola bilər.`)
  }

  function handleDeleted(tenant) {
    setDeleting(null)
    if (selectedId === tenant.id) {
      setSelectedId(null)
    }
    tenants.reload()
    showToast('Şirkət uğurla silindi.')
  }

  return (
    <AdminPage
      title="Şirkətlər"
      description="Platformadakı bütün şirkətlər (tenantlar): status, istifadəçilər və baxış rejiminə keçid."
      action={
        <button type="button" className={styles.adminButtonPrimary} onClick={() => setCreating(true)}>
          + Yeni şirkət
        </button>
      }
    >
      <div className={styles.adminKpiGrid}>
        <AdminKpi label="Ümumi şirkət" value={loaded ? String(all.length) : null} isLoading={tenants.isLoading} />
        <AdminKpi label="Aktiv" value={loaded ? String(countOf(TENANT_ACTIVE)) : null} tone="positive" isLoading={tenants.isLoading} />
        <AdminKpi
          label="Passiv / dondurulmuş"
          value={loaded ? `${countOf(TENANT_PASSIVE)} / ${countOf(TENANT_SUSPENDED)}` : null}
          tone={countOf(TENANT_SUSPENDED) > 0 ? 'warning' : 'default'}
          isLoading={tenants.isLoading}
        />
        <AdminKpi
          label="İstifadəçilər"
          value={loaded ? String(all.reduce((sum, tenant) => sum + tenant.userCount, 0)) : null}
          hint="Bütün şirkətlər üzrə"
          isLoading={tenants.isLoading}
        />
      </div>

      <div className={styles.adminToolbar}>
        <input
          type="search"
          className={styles.adminSearch}
          placeholder="Ad və ya VÖEN üzrə axtarış…"
          aria-label="Şirkət axtarışı"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <AdminChips label="Status filtri" options={filters} value={statusFilter} onChange={setStatusFilter} />
      </div>

      {tenants.error ? <AdminError message={tenants.error} onRetry={tenants.reload} /> : null}

      <div className={styles.adminTableWrap}>
        <table className={styles.adminTable}>
          <thead className={styles.adminTableHead}>
            <tr>
              <th className={styles.adminTh}>Şirkət</th>
              <th className={styles.adminTh}>VÖEN</th>
              <th className={styles.adminTh}>Yaradılıb</th>
              <th className={styles.adminTh}>Status</th>
              <th className={styles.adminTh}>Dəvət kodu</th>
              <th className={`${styles.adminTh} text-right`}>İstifadəçi</th>
              <th className={`${styles.adminTh} text-right`}>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tenant) => (
              <tr key={tenant.id} className={styles.adminTr}>
                <td className={styles.adminTd}>
                  <button type="button" className={styles.adminNameButton} onClick={() => setSelectedId(tenant.id)}>
                    {tenant.name}
                  </button>
                </td>
                <td className={styles.adminTdMuted}>{tenant.voen || '—'}</td>
                <td className={styles.adminTdMuted}>{formatDate(fromApiDate(tenant.createdAt))}</td>
                <td className={styles.adminTd}>
                  <TenantStatusControl tenant={tenant} onChanged={tenants.reload} />
                </td>
                <td className={styles.adminTd}>
                  <button
                    type="button"
                    className={styles.adminButtonSmall}
                    title="Dəvət kodunu kopyala"
                    aria-label={`«${tenant.name}» dəvət kodunu kopyala: ${tenant.inviteCode}`}
                    onClick={() => copyInviteCode(tenant.inviteCode)}
                  >
                    <span className={styles.adminMono}>{formatInviteCode(tenant.inviteCode)}</span> ⧉
                  </button>
                </td>
                <td className={styles.adminTdNumber}>{tenant.userCount}</td>
                <td className={styles.adminTd}>
                  <div className={styles.adminRowActions}>
                    <button type="button" className={styles.adminButtonSmall} onClick={() => setAddingUserTo(tenant)}>
                      ➕ İstifadəçi əlavə et
                    </button>
                    <button type="button" className={styles.adminButtonSmall} onClick={() => setSelectedId(tenant.id)}>
                      Ətraflı
                    </button>
                    <button
                      type="button"
                      className={styles.adminButtonSmall}
                      disabled={pendingId === tenant.id}
                      onClick={() => switchTo(tenant.id)}
                    >
                      {pendingId === tenant.id ? 'Açılır…' : 'Şirkətə keç →'}
                    </button>
                    <button type="button" className={styles.adminButtonSmallDanger} onClick={() => setDeleting(tenant)}>
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !(tenants.error && !loaded) ? (
              <tr>
                <td colSpan={7} className={styles.adminTableState}>
                  {!loaded ? 'Yüklənir…' : all.length === 0 ? 'Hələ şirkət yoxdur.' : 'Axtarışa uyğun şirkət tapılmadı.'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {selectedId ? (
        <TenantDetailsModal
          tenantId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={tenants.reload}
          onSwitch={switchTo}
          switching={pendingId === selectedId}
        />
      ) : null}
      {addingUserTo ? (
        <CreateTenantUserModal
          tenant={addingUserTo}
          onClose={() => setAddingUserTo(null)}
          onCreated={handleUserCreated}
        />
      ) : null}
      {deleting ? (
        <DeleteTenantModal tenant={deleting} onClose={() => setDeleting(null)} onDeleted={handleDeleted} />
      ) : null}
      {creating ? <CreateTenantModal onClose={() => setCreating(false)} onCreated={handleCreated} /> : null}
    </AdminPage>
  )
}
