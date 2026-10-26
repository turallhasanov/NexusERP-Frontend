import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { TableState } from '@/components/ui/table-state'
import { formatQuantityValue, occupancyLabel } from '@/features/warehouses/lib/warehouse-format'
import { styles } from '@/lib/styles'

const BASE_COLUMNS = ['Kod', 'Ad', 'Ünvan', 'Məsul şəxs', 'Məhsul çeşidi', 'Cəmi qalıq', 'Doluluq']

// Every user can open a warehouse's stock; editing and deleting are for company admins and IT admins.
export function WarehouseTable({
  warehouses,
  isLoading = false,
  error = '',
  onRetry,
  canManage = false,
  deletingId = null,
  onOpen,
  onEdit,
  onDelete,
}) {
  const columns = [...BASE_COLUMNS, 'Əməliyyat']
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
            isEmpty={warehouses.length === 0}
            emptyText="Hələ anbar yoxdur."
          />
          {showRows
            ? warehouses.map((warehouse) => (
                <tr key={warehouse.id} className={styles.tableRow}>
                  <td className={styles.tableCellMuted}>{warehouse.code}</td>
                  <td className={styles.tableCell}>{warehouse.name}</td>
                  <td className={styles.tableCellMuted}>{warehouse.address || '—'}</td>
                  <td className={styles.tableCellMuted}>{warehouse.responsiblePerson || '—'}</td>
                  <td className={styles.tableCell}>{warehouse.productCount ?? 0}</td>
                  <td className={styles.tableCell}>{formatQuantityValue(warehouse.totalQuantity)}</td>
                  <td className={styles.tableCellMuted}>{occupancyLabel(warehouse)}</td>
                  <td className={styles.tableCell}>
                    <div className={styles.rowActions}>
                      <button type="button" className={styles.textActionStrong} onClick={() => onOpen(warehouse)}>
                        Stok və hərəkətlər
                      </button>
                      {canManage ? (
                        <>
                          <button
                            type="button"
                            className={styles.headerAction}
                            onClick={() => onEdit(warehouse)}
                            disabled={Boolean(deletingId)}
                          >
                            Redaktə et
                          </button>
                          <button
                            type="button"
                            className={styles.headerAction}
                            onClick={() => onDelete(warehouse)}
                            disabled={Boolean(deletingId)}
                          >
                            {deletingId === warehouse.id ? <Spinner /> : 'Sil'}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </Card>
  )
}
