import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { assignRole, fetchRoles } from '@/features/roles/api/roles-api'
import { fetchCompanyUsers, updateCompanyUserRole } from '@/features/settings/api/company-users'
import { useApiQuery } from '@/hooks/use-api-query'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'
import { showToast } from '@/store/toast-store'
import { COMPANY_ROLE_OPTIONS, USER_ROLE_LABELS } from '@/types/auth'

const TABLE_COLUMNS = ['Ad Soyad', 'E-poçt', 'Giriş səviyyəsi', 'Vəzifə rolu']

// Company users with two pickers: the access level (admin, itadmin, staff; the signed-in manager's own row is
// read-only, the API refuses it too) and the company's custom job role from «Rollar və İcazələr».
export function CompanyUsersTable() {
  const { user: currentUser } = useAuthStore()
  const users = useApiQuery(fetchCompanyUsers)
  const roles = useApiQuery(fetchRoles)
  const [savingId, setSavingId] = useState(null)

  async function changeRole(user, role) {
    setSavingId(user.id)

    try {
      await updateCompanyUserRole(user.id, role)
      showToast(`${user.name}: rol «${USER_ROLE_LABELS[role]}» təyin edildi. Növbəti girişdə qüvvəyə minir.`)
      users.reload()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setSavingId(null)
    }
  }

  async function changeCustomRole(user, roleId) {
    setSavingId(user.id)

    try {
      const updated = await assignRole(user.id, roleId || null)
      showToast(
        updated.customRoleName
          ? `${user.name}: «${updated.customRoleName}» rolu təyin edildi.`
          : `${user.name}: vəzifə rolu götürüldü.`,
      )
      users.reload()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setSavingId(null)
    }
  }

  if (users.isLoading && !users.data) {
    return (
      <Card>
        <div className={styles.loadingRow}>
          <Spinner />
          Yüklənir…
        </div>
      </Card>
    )
  }

  if (users.error && !users.data) {
    return (
      <Card>
        <div className={styles.errorRow}>
          <span>{users.error}</span>
          <button type="button" className={styles.textAction} onClick={users.reload}>
            Yenidən cəhd et
          </button>
        </div>
      </Card>
    )
  }

  return (
    <Card padded={false}>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            {TABLE_COLUMNS.map((column) => (
              <th key={column} className={styles.tableHeadCell}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.data.map((user) => (
            <tr key={user.id} className={styles.tableRow}>
              <td className={styles.tableCell}>{user.name}</td>
              <td className={styles.tableCellMuted}>{user.email}</td>
              <td className={styles.tableCell}>
                {user.id === currentUser?.id ? (
                  USER_ROLE_LABELS[user.role] ?? user.role
                ) : (
                  <select
                    aria-label={`${user.name} rolu`}
                    className={styles.input}
                    value={user.role}
                    disabled={savingId === user.id}
                    onChange={(event) => changeRole(user, event.target.value)}
                  >
                    {COMPANY_ROLE_OPTIONS.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                )}
              </td>
              <td className={styles.tableCell}>
                <select
                  aria-label={`${user.name} vəzifə rolu`}
                  className={styles.input}
                  value={user.customRoleId ?? ''}
                  disabled={savingId === user.id || !roles.data}
                  onChange={(event) => changeCustomRole(user, event.target.value)}
                >
                  <option value="">— Rol yoxdur —</option>
                  {(roles.data ?? []).map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
