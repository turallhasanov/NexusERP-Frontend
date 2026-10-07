import { Card } from '@/components/ui/card'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Qaimə', 'Kontragent', 'Məhsul', 'Depo', 'İşçi', 'Say', 'Məbləğ']

export function PurchaseTable({ purchases }) {
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
          {purchases.length === 0 ? (
            <tr>
              <td className={styles.tableEmpty} colSpan={TABLE_COLUMNS.length}>
                Hələ alış yoxdur.
              </td>
            </tr>
          ) : (
            purchases.map((purchase) => (
              <tr key={purchase.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{purchase.number}</td>
                <td className={styles.tableCell}>{purchase.customer}</td>
                <td className={styles.tableCellMuted}>{purchase.product}</td>
                <td className={styles.tableCellMuted}>{purchase.warehouse}</td>
                <td className={styles.tableCellMuted}>{purchase.user}</td>
                <td className={styles.tableCell}>{purchase.quantity}</td>
                <td className={styles.tableCell}>{formatAzn(purchase.total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  )
}
