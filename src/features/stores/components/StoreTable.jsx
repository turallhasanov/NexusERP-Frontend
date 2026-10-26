import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { TableState } from '@/components/ui/table-state'
import { styles } from '@/lib/styles'

const BASE_COLUMNS = ['Kod', 'Ad', 'Anbar', 'Ünvan']

// `canManage` (company admins and IT admins) adds "Redaktə et" and "Sil".
export function StoreTable({ stores, isLoading = false, error = '', onRetry, canManage = false, deletingId = null, onEdit, onDelete }) {
  const columns = canManage ? [...BASE_COLUMNS, 'Əməliyyat'] : BASE_COLUMNS
  const showRows = !isLoading && !error

  return (
    <Card padded={false}>
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
            isEmpty={stores.length === 0}
            emptyText="Hələ mağaza yoxdur."
          />
          {showRows
            ? stores.map((store) => (
                <tr key={store.id} className={styles.tableRow}>
                  <td className={styles.tableCellMuted}>{store.code}</td>
                  <td className={styles.tableCell}>{store.name}</td>
                  {/* The API embeds the warehouse, so this works even for an inactive one. */}
                  <td className={styles.tableCellMuted}>{store.warehouse?.name ?? '—'}</td>
                  <td className={styles.tableCellMuted}>{store.address || '—'}</td>
                  {canManage ? (
                    <td className={styles.tableCell}>
                      <div className={styles.rowActions}>
                        <button type="button" className={styles.headerAction} onClick={() => onEdit(store)} disabled={Boolean(deletingId)}>
                          Redaktə et
                        </button>
                        <button type="button" className={styles.dangerAction} onClick={() => onDelete(store)} disabled={Boolean(deletingId)}>
                          {deletingId === store.id ? <Spinner /> : 'Sil'}
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </Card>
  )
}
