import { Card } from '@/components/ui/card'
import { StockAlertBadge } from '@/features/inventory/components/StockAlertBadge'
import { styles } from '@/lib/styles'

export function ProductTable({ products, warehouses = [] }) {
  return (
    <Card padded={false}>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.tableHeadCell}>Məhsul</th>
            <th className={styles.tableHeadCell}>Anbar kodu</th>
            <th className={styles.tableHeadCell}>Barkod</th>
            {warehouses.map((warehouse) => (
              <th key={warehouse.id} className={styles.tableHeadCell}>
                {warehouse.name}
              </th>
            ))}
            <th className={styles.tableHeadCell}>Miqdar</th>
            <th className={styles.tableHeadCell}>Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className={styles.tableRow}>
              <td className={styles.tableCell}>{product.name}</td>
              <td className={styles.tableCellMuted}>{product.sku}</td>
              <td className={styles.tableCellMuted}>{product.barcode}</td>
              {warehouses.map((warehouse) => (
                <td key={warehouse.id} className={styles.tableCellMuted}>
                  {product.stocks[warehouse.id] ?? 0}
                </td>
              ))}
              <td className={styles.tableCell}>{product.quantity}</td>
              <td className={styles.tableCell}>
                <StockAlertBadge
                  quantity={product.quantity}
                  minQuantity={product.minQuantity}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
