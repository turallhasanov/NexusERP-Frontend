import { Card } from '@/components/ui/card'
import { TableState } from '@/components/ui/table-state'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Kod', 'Ad', 'VÖEN', 'Telefon', 'Ünvan']

export function CustomerTable({ customers, isLoading = false, error = '', onRetry }) {
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
            isEmpty={customers.length === 0}
            emptyText="Hələ kontragent yoxdur."
          />
          {showRows
            ? customers.map((customer) => (
                <tr key={customer.id} className={styles.tableRow}>
                  <td className={styles.tableCellMuted}>{customer.code}</td>
                  <td className={styles.tableCell}>{customer.name}</td>
                  <td className={styles.tableCellMuted}>{customer.voen || '—'}</td>
                  <td className={styles.tableCellMuted}>{customer.phone || '—'}</td>
                  <td className={styles.tableCellMuted}>{customer.address || '—'}</td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </Card>
  )
}
