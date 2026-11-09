import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { StatCard } from '@/components/ui/stat-card'
import { approveUser, fetchUsers, setUserActive } from '@/features/users/api/users-api'
import { UserApproveModal } from '@/features/users/components/UserApproveModal'
import { UserStatusModal } from '@/features/users/components/UserStatusModal'
import { useApiQuery } from '@/hooks/use-api-query'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { fromApiDate } from '@/lib/date'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'
import { showToast } from '@/store/toast-store'
import { USER_ROLE_LABELS } from '@/types/auth'

const COLUMNS = ['Ad / Soyad', 'E-poçt', 'Rol', 'Status', 'Yaradılıb', 'Əməliyyatlar']

function formatDate(value) {
  const date = new Date(fromApiDate(value))
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// «İstifadəçilər» (IT admins): the company's users, how many are active, and the switch that cuts a leaver's access.
export function UsersPage() {
  const { user: currentUser } = useAuthStore()
  const users = useApiQuery(fetchUsers)
  const [target, setTarget] = useState(null)
  const [approveTarget, setApproveTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  useDocumentTitle('İstifadəçilər')

  const rows = users.data ?? []
  const activeCount = rows.filter((user) => user.isActive).length

  async function confirmChange() {
    setSaving(true)

    try {
      const updated = await setUserActive(target.id, !target.isActive)
      showToast(updated.isActive ? `${updated.name} aktivləşdirildi.` : `${updated.name} deaktiv edildi.`)
      setTarget(null)
      users.reload()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function confirmApprove(role) {
    setSaving(true)

    try {
      const updated = await approveUser(approveTarget.id, role)
      showToast(`${updated.name} təsdiqləndi.`)
      setApproveTarget(null)
      users.reload()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer
      title="İstifadəçilər"
      description="Şirkətə qeydiyyatdan keçmiş istifadəçilər. İşdən ayrılan işçinin hesabını burada deaktiv edin: daxil ola bilməz və açıq sessiyası bağlanır."
    >
      <div className={styles.summaryGrid}>
        <StatCard label="Cəmi istifadəçi" value={users.data ? rows.length : null} isLoading={users.isLoading} />
        <StatCard label="Aktiv" value={users.data ? activeCount : null} tone="positive" isLoading={users.isLoading} />
        <StatCard
          label="Deaktiv"
          value={users.data ? rows.length - activeCount : null}
          tone={users.data && rows.length - activeCount > 0 ? 'negative' : 'default'}
          isLoading={users.isLoading}
        />
      </div>

      {users.isLoading && !users.data ? (
        <Card>
          <div className={styles.loadingRow}>
            <Spinner />
            Yüklənir…
          </div>
        </Card>
      ) : null}

      {users.error && !users.data ? (
        <Card>
          <div className={styles.errorRow}>
            <span>{users.error}</span>
            <button type="button" className={styles.textAction} onClick={users.reload}>
              Yenidən cəhd et
            </button>
          </div>
        </Card>
      ) : null}

      {users.data ? (
        <Card padded={false}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                {COLUMNS.map((column) => (
                  <th key={column} className={styles.tableHeadCell}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{user.name}</td>
                  <td className={styles.tableCellMuted}>{user.email}</td>
                  <td className={styles.tableCell}>
                    {[USER_ROLE_LABELS[user.role] ?? user.role, user.customRoleName].filter(Boolean).join(' · ')}
                  </td>
                  <td className={styles.tableCell}>
                    <Badge variant={user.isActive ? 'success' : 'danger'}>{user.isActive ? 'Aktiv' : 'Deaktiv'}</Badge>
                    {user.isApproved === false ? <Badge variant="warning">Təsdiq gözləyir</Badge> : null}
                  </td>
                  <td className={styles.tableCellMuted}>{formatDate(user.createdAt)}</td>
                  <td className={styles.tableCell}>
                    {user.id === currentUser?.id ? (
                      <span className="text-sm text-neutral-500">Siz</span>
                    ) : (
                      <div className="flex gap-4">
                        {user.isApproved === false ? (
                          <button
                            type="button"
                            className={styles.textAction}
                            aria-label={`${user.name}: təsdiqlə və rol ver`}
                            onClick={() => setApproveTarget(user)}
                          >
                            Təsdiqlə / Rol təyin et
                          </button>
                        ) : null}
                      <button
                        type="button"
                        className={styles.textAction}
                        aria-label={`${user.name}: ${user.isActive ? 'deaktiv et' : 'aktivləşdir'}`}
                        onClick={() => setTarget(user)}
                      >
                        {user.isActive ? 'Deaktiv et' : 'Aktivləşdir'}
                      </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}

      {approveTarget ? (
        <UserApproveModal user={approveTarget} saving={saving} onConfirm={confirmApprove} onClose={() => setApproveTarget(null)} />
      ) : null}
      {target ? <UserStatusModal user={target} saving={saving} onConfirm={confirmChange} onClose={() => setTarget(null)} /> : null}
    </PageContainer>
  )
}
