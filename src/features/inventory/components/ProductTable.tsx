import { Card } from '@/components/ui/card.tsx'
import { StockAlertBadge } from '@/features/inventory/components/StockAlertBadge.tsx'
import type { Product } from '@/features/inventory/types.ts'
import { styles } from '@/lib/styles.ts'

type ProductTableProps = {
  products: Product[]
}

const TABLE_COLUMNS = ['Məhsul', 'Anbar kodu', 'Miqdar', 'Status'] as const

export function ProductTable({ products }: ProductTableProps) {
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
          {products.map((product) => (
            <tr key={product.id} className={styles.tableRow}>
              <td className={styles.tableCell}>{product.name}</td>
              <td className={styles.tableCellMuted}>{product.sku}</td>
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
