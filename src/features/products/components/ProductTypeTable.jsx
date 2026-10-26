import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { TableState } from '@/components/ui/table-state'
import { deleteProductType, updateProductType } from '@/features/products/api/manage-product-type'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'
import { showToast } from '@/store/toast-store'
import { isCompanyManager } from '@/types/auth'

export function ProductTypeTable({ types, isLoading, error, onRetry }) {
  // Renaming and deleting are for company admins and IT admins; staff see the list only.
  const { user } = useAuthStore()
  const canManage = isCompanyManager(user)
  const columns = canManage ? ['Kod', 'Ad', 'Əməliyyat'] : ['Kod', 'Ad']

  // "Redaktə et" only opens the row for editing; nothing is sent until "Yadda saxla".
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [busyId, setBusyId] = useState('')
  const [rowError, setRowError] = useState('')
  const showRows = !isLoading && !error

  function startEdit(type) {
    setRowError('')
    setEditingId(type.id)
    setEditingName(type.name)
  }

  function cancelEdit() {
    setRowError('')
    setEditingId(null)
    setEditingName('')
  }

  async function handleSave() {
    const name = editingName.trim()

    if (!name) {
      setRowError('Kateqoriya adı boş ola bilməz.')
      showToast('Kateqoriya adı boş ola bilməz.', 'error')
      return
    }

    setRowError('')
    setBusyId(editingId)

    const result = await updateProductType(editingId, { name })

    setBusyId('')

    if (!result.ok) {
      setRowError(result.error)
      return
    }

    cancelEdit()
    showToast('Kateqoriya adı uğurla yeniləndi.')
  }

  async function handleDelete(type) {
    if (!window.confirm(`"${type.name}" kateqoriyası silinsin?`)) {
      return
    }

    setRowError('')
    setBusyId(type.id)

    const result = await deleteProductType(type.id)

    setBusyId('')

    if (!result.ok) {
      setRowError(result.error)
      return
    }

    showToast(`Kateqoriya silindi: ${type.name}`)
  }

  return (
    <Card padded={false}>
      {rowError ? <p className={styles.formError}>{rowError}</p> : null}
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            {columns.map((column) => (
              <th key={column} className={styles.tableHeadCell}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <TableState
            colSpan={columns.length}
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            isEmpty={types.length === 0}
            emptyText="Hələ kateqoriya yoxdur."
          />
          {showRows
            ? types.map((type) => {
                const isEditing = editingId === type.id
                const isBusy = busyId === type.id

                return (
                  <tr key={type.id} className={styles.tableRow}>
                    <td className={styles.tableCellMuted}>{type.code}</td>
                    <td className={styles.tableCell}>
                      {isEditing ? (
                        <input
                          className={styles.inlineEditInput}
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              void handleSave()
                            } else if (event.key === 'Escape') {
                              cancelEdit()
                            }
                          }}
                          aria-label="Kateqoriya adı"
                          maxLength={200}
                          disabled={isBusy}
                          autoFocus
                        />
                      ) : (
                        type.name
                      )}
                    </td>
                    {canManage ? (
                      <td className={styles.tableCell}>
                        {/* Distinct keys per mode, so React never reuses the clicked button as another one. */}
                        <div className={styles.rowActions}>
                          {isEditing ? (
                            <>
                              <button
                                key="save"
                                type="button"
                                className={styles.textActionStrong}
                                onClick={() => void handleSave()}
                                disabled={isBusy}
                              >
                                {isBusy ? <Spinner /> : 'Yadda saxla'}
                              </button>
                              <button
                                key="cancel"
                                type="button"
                                className={styles.headerAction}
                                onClick={cancelEdit}
                                disabled={isBusy}
                              >
                                Ləğv et
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                key="edit"
                                type="button"
                                className={styles.headerAction}
                                onClick={() => startEdit(type)}
                                disabled={Boolean(busyId)}
                              >
                                Redaktə et
                              </button>
                              <button
                                key="delete"
                                type="button"
                                className={styles.headerAction}
                                onClick={() => handleDelete(type)}
                                disabled={Boolean(busyId)}
                              >
                                {isBusy ? <Spinner /> : 'Sil'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                )
              })
            : null}
        </tbody>
      </table>
    </Card>
  )
}
