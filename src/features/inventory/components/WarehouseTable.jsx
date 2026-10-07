import { Card } from '@/components/ui/card'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Ad', 'Kod']

export function WarehouseTable({ warehouses }) {
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
          {warehouses.map((warehouse) => (
            <tr key={warehouse.id} className={styles.tableRow}>
              <td className={styles.tableCell}>{warehouse.name}</td>
              <td className={styles.tableCellMuted}>{warehouse.code}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
