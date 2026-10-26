import { useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { assignRole } from '@/features/roles/api/roles-api'
import { fetchCompanyUsers } from '@/features/settings/api/company-users'
import { useApiQuery } from '@/hooks/use-api-query'
import { styles } from '@/lib/styles'
import { showToast } from '@/store/toast-store'

// Gives `role` to company users or takes it away. A user has at most one custom role, so assigning this
// one replaces any other they had. `onChanged` lets the page refresh its user counts.
export function AssignRoleModal({ role, onClose, onChanged }) {
  const users = useApiQuery(fetchCompanyUsers)
  const [savingId, setSavingId] = useState(null)

  async function change(user, roleId) {
    setSavingId(user.id)

    try {
      await assignRole(user.id, roleId)
      showToast(roleId ? `${user.name}: «${role.name}» rolu təyin edildi.` : `${user.name}: «${role.name}» rolu götürüldü.`)
      users.reload()
      onChanged()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <AdminModal
      title="İstifadəçilərə təyin et"
      labelId="assign-role-title"
      width="narrow"
      onClose={onClose}
      header={<p className={styles.adminModalMeta}>Rol: {role.name}</p>}
    >
      {users.isLoading && !users.data ? (
        <div className={styles.loadingRow}>
          <Spinner />
          Yüklənir…
        </div>
      ) : users.error && !users.data ? (
        <div className={styles.errorRow}>
          <span>{users.error}</span>
          <button type="button" className={styles.textAction} onClick={users.reload}>
            Yenidən cəhd et
          </button>
        </div>
      ) : (
        <ul className={styles.roleUserList}>
          {users.data.map((user) => {
            const hasRole = user.customRoleId === role.id

            return (
              <li key={user.id} className={styles.roleUserRow}>
                <div className={styles.roleUserMeta}>
                  <p className={styles.roleUserName}>{user.name}</p>
                  <p className={styles.roleUserHint}>
                    {user.email}
                    {user.customRoleName && !hasRole ? ` · hazırkı rol: ${user.customRoleName}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  className={hasRole ? styles.adminButtonGhost : styles.adminButtonPrimary}
                  disabled={Boolean(savingId)}
                  onClick={() => change(user, hasRole ? null : role.id)}
                >
                  {savingId === user.id ? <Spinner /> : hasRole ? 'Rolu götür' : 'Təyin et'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <div className={styles.adminModalActions}>
        <button type="button" className={styles.adminButtonGhost} onClick={onClose}>
          Bağla
        </button>
      </div>
    </AdminModal>
  )
}
