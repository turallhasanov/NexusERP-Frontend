import { Card } from '@/components/ui/card'
import { TableState } from '@/components/ui/table-state'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Kod', 'Ad', 'Depo', 'Ünvan']

export function StoreTable({ stores, isLoading = false, error = '', onRetry }) {
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
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </Card>
  )
}
