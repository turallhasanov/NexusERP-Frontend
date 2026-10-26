import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { TableState } from '@/components/ui/table-state'
import { deleteRole, fetchRoles } from '@/features/roles/api/roles-api'
import { AssignRoleModal } from '@/features/roles/components/AssignRoleModal'
import { RoleFormModal } from '@/features/roles/components/RoleFormModal'
import { permissionLabel } from '@/features/roles/permissions'
import { useApiQuery } from '@/hooks/use-api-query'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'
import { showToast } from '@/store/toast-store'

const TABLE_COLUMNS = ['Rol', 'Təsvir', 'İcazələr', 'İstifadəçi', 'Əməliyyat']
const ROLE_IN_USE = 'Bu rola bağlı istifadəçi var, silinə bilməz.'

// The company's custom job roles. Reached only by admins and IT admins (RequireCompanyManager; the API too).
export function RolesPage() {
  const roles = useApiQuery(fetchRoles)
  // { type: 'form', role: null | role } for create/edit, { type: 'assign', role } for assigning users.
  const [dialog, setDialog] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  useDocumentTitle('Rollar və İcazələr')

  const items = roles.data ?? []
  const showRows = Boolean(roles.data) && !roles.error

  function handleSaved(role) {
    showToast(dialog.role ? `Rol yeniləndi: ${role.name}` : 'Rol uğurla yaradıldı!')
    setDialog(null)
    roles.reload()
  }

  async function handleDelete(role) {
    if (role.userCount > 0) {
      showToast(ROLE_IN_USE, 'error')
      return
    }

    if (!window.confirm(`«${role.name}» rolu silinsin?`)) {
      return
    }

    setDeletingId(role.id)

    try {
      await deleteRole(role.id)
      showToast(`Rol silindi: ${role.name}`)
      roles.reload()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <PageContainer
      title="Rollar və İcazələr"
      description="Şirkətin vəzifə rollarını yaradın, modullar üzrə icazələrini qeyd edin və işçilərə təyin edin."
      action={<Button onClick={() => setDialog({ type: 'form', role: null })}>➕ Yeni Rol Yarat</Button>}
    >
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
            <TableState
              colSpan={TABLE_COLUMNS.length}
              isLoading={roles.isLoading && !roles.data}
              error={roles.data ? '' : roles.error}
              onRetry={roles.reload}
              isEmpty={items.length === 0}
              emptyText="Hələ rol yoxdur. «Yeni Rol Yarat» ilə ilk rolu əlavə edin."
            />
            {showRows
              ? items.map((role) => (
                  <tr key={role.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{role.name}</td>
                    <td className={styles.tableCellMuted}>{role.description || '—'}</td>
                    <td className={styles.tableCell}>
                      {role.permissions.length === 0 ? (
                        '—'
                      ) : (
                        <div className={styles.rolePermissionList}>
                          {role.permissions.map((permission) => (
                            <Badge key={permission}>{permissionLabel(permission)}</Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className={styles.tableCell}>{role.userCount}</td>
                    <td className={styles.tableCell}>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.headerAction}
                          onClick={() => setDialog({ type: 'form', role })}
                        >
                          Redaktə et
                        </button>
                        <button
                          type="button"
                          className={styles.headerAction}
                          onClick={() => setDialog({ type: 'assign', role })}
                        >
                          İstifadəçilərə təyin et
                        </button>
                        <button
                          type="button"
                          className={styles.headerAction}
                          onClick={() => handleDelete(role)}
                          disabled={Boolean(deletingId)}
                        >
                          {deletingId === role.id ? <Spinner /> : 'Sil'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </Card>

      {dialog?.type === 'form' ? (
        <RoleFormModal role={dialog.role} onClose={() => setDialog(null)} onSaved={handleSaved} />
      ) : null}
      {dialog?.type === 'assign' ? (
        <AssignRoleModal role={dialog.role} onClose={() => setDialog(null)} onChanged={roles.reload} />
      ) : null}
    </PageContainer>
  )
}
