import { Card } from '@/components/ui/card'
import { TableState } from '@/components/ui/table-state'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Kod', 'Ad', 'Ünvan']

export function WarehouseTable({ warehouses, isLoading = false, error = '', onRetry }) {
  const showRows = !isLoading && !error

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
          <TableState
            colSpan={TABLE_COLUMNS.length}
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            isEmpty={warehouses.length === 0}
            emptyText="Hələ depo yoxdur."
          />
          {showRows
            ? warehouses.map((warehouse) => (
                <tr key={warehouse.id} className={styles.tableRow}>
                  <td className={styles.tableCellMuted}>{warehouse.code}</td>
                  <td className={styles.tableCell}>{warehouse.name}</td>
                  <td className={styles.tableCellMuted}>{warehouse.address || '—'}</td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </Card>
  )
}
