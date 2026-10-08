import { Card } from '@/components/ui/card'
import { StockAlertBadge } from '@/features/inventory/components/StockAlertBadge'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'
import { getProductType } from '@/store/product-types-store'
import { formatQuantity, getProductUnit } from '@/store/product-units-store'

export function ProductTable({ products, warehouses = [] }) {
  return (
    <Card padded={false}>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.tableHeadCell}>Məhsul</th>
            <th className={styles.tableHeadCell}>Tip</th>
            <th className={styles.tableHeadCell}>Vahid</th>
            <th className={styles.tableHeadCell}>Anbar kodu</th>
            <th className={styles.tableHeadCell}>Barkod</th>
            <th className={styles.tableHeadCell}>Qiymət</th>
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
              <td className={styles.tableCellMuted}>{getProductType(product.typeId)?.name ?? '—'}</td>
              <td className={styles.tableCellMuted}>{getProductUnit(product.unitId)?.name ?? '—'}</td>
              <td className={styles.tableCellMuted}>{product.sku}</td>
              <td className={styles.tableCellMuted}>{product.barcode}</td>
              <td className={styles.tableCell}>{formatAzn(product.unitPrice)}</td>
              {warehouses.map((warehouse) => (
                <td key={warehouse.id} className={styles.tableCellMuted}>
                  {formatQuantity(product.stocks[warehouse.id] ?? 0, product.unitId)}
                </td>
              ))}
              <td className={styles.tableCell}>{formatQuantity(product.quantity, product.unitId)}</td>
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
