import { Card } from '@/components/ui/card'
import { styles } from '@/lib/styles'
import { getWarehouse } from '@/store/warehouses-store'

const TABLE_COLUMNS = ['Ad', 'Kod', 'Depo']

export function StoreTable({ stores }) {
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
          {stores.length === 0 ? (
            <tr>
              <td className={styles.tableEmpty} colSpan={TABLE_COLUMNS.length}>
                Hələ mağaza yoxdur.
              </td>
            </tr>
          ) : (
            stores.map((store) => (
              <tr key={store.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{store.name}</td>
                <td className={styles.tableCellMuted}>{store.code}</td>
                <td className={styles.tableCellMuted}>{getWarehouse(store.warehouseId)?.name ?? '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  )
}
