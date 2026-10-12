import { Card } from '@/components/ui/card'
import { TableState } from '@/components/ui/table-state'
import { StockAlertBadge } from '@/features/inventory/components/StockAlertBadge'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'
import { getProductType } from '@/store/product-types-store'
import { formatQuantity, getProductUnit } from '@/store/product-units-store'

const LEADING_COLUMNS = ['Kod', 'Məhsul', 'Kateqoriya', 'Vahid', 'Barkod', 'Alış qiyməti', 'Satış qiyməti']
const TRAILING_COLUMNS = ['Miqdar', 'Status']

export function ProductTable({
  products,
  warehouses = [],
  isLoading = false,
  error = '',
  onRetry,
  emptyText = 'Hələ məhsul yoxdur.',
}) {
  const columnCount = LEADING_COLUMNS.length + warehouses.length + TRAILING_COLUMNS.length
  const showRows = !isLoading && !error

  return (
    <Card padded={false}>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            {LEADING_COLUMNS.map((column) => (
              <th key={column} className={styles.tableHeadCell}>
                {column}
              </th>
            ))}
            {warehouses.map((warehouse) => (
              <th key={warehouse.id} className={styles.tableHeadCell}>
                {warehouse.name}
              </th>
            ))}
            {TRAILING_COLUMNS.map((column) => (
              <th key={column} className={styles.tableHeadCell}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <TableState
            colSpan={columnCount}
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            isEmpty={products.length === 0}
            emptyText={emptyText}
          />
          {showRows
            ? products.map((product) => (
                <tr key={product.id} className={styles.tableRow}>
                  <td className={styles.tableCellMuted}>{product.sku}</td>
                  <td className={styles.tableCell}>{product.name}</td>
                  <td className={styles.tableCellMuted}>{getProductType(product.typeId)?.name ?? '—'}</td>
                  <td className={styles.tableCellMuted}>{getProductUnit(product.unitId)?.name ?? '—'}</td>
                  <td className={styles.tableCellMuted}>{product.barcode}</td>
                  <td className={styles.tableCellMuted}>{formatAzn(product.purchasePrice)}</td>
                  <td className={styles.tableCell}>{formatAzn(product.unitPrice)}</td>
                  {warehouses.map((warehouse) => (
                    <td key={warehouse.id} className={styles.tableCellMuted}>
                      {formatQuantity(product.stocks[warehouse.id] ?? 0, product.unitId)}
                    </td>
                  ))}
                  <td className={styles.tableCell}>{formatQuantity(product.quantity, product.unitId)}</td>
                  <td className={styles.tableCell}>
                    <StockAlertBadge quantity={product.quantity} minQuantity={product.minQuantity} />
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </Card>
  )
}
