import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { StatCard } from '@/components/ui/stat-card'
import { TableState } from '@/components/ui/table-state'
import { fetchInventoryValue } from '@/features/reports/api/reports-api'
import { useApiQuery } from '@/hooks/use-api-query'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Anbar', 'Qalıq miqdarı', 'Dəyər (alış qiyməti ilə)', 'Payı']

function formatShare(part, total) {
  return total > 0 ? `${((part / total) * 100).toFixed(1)}%` : '—'
}

export function InventoryValueReport() {
  const report = useApiQuery(fetchInventoryValue)
  const rows = report.data ?? []
  const totalValue = rows.reduce((sum, row) => sum + row.totalStockValue, 0)
  const totalQuantity = rows.reduce((sum, row) => sum + row.totalStockQuantity, 0)
  const hasData = report.data !== null

  return (
    <section className="space-y-4" aria-labelledby="inventory-value-title">
      <h2 id="inventory-value-title" className={styles.sectionTitle}>
        Anbar dəyəri {report.isLoading && hasData ? <Spinner className="ml-2 align-middle" /> : null}
      </h2>
      <div className={styles.summaryGrid}>
        <StatCard label="Ümumi dəyər" value={hasData ? formatAzn(totalValue) : null} hint="Cari alış qiyməti ilə" isLoading={report.isLoading} />
        <StatCard label="Ümumi qalıq" value={hasData ? String(totalQuantity) : null} hint="Bütün vahidlər cəmi" isLoading={report.isLoading} />
        <StatCard label="Anbar sayı" value={hasData ? String(rows.length) : null} isLoading={report.isLoading} />
      </div>
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
              isLoading={report.isLoading && !hasData}
              error={report.error}
              onRetry={report.reload}
              isEmpty={rows.length === 0}
              emptyText="Hələ anbar yoxdur."
            />
            {hasData && !report.error
              ? rows.map((row) => (
                  <tr key={row.warehouseId} className={styles.tableRow}>
                    <td className={styles.tableCell}>{row.warehouseName}</td>
                    <td className={styles.tableCellMuted}>{row.totalStockQuantity}</td>
                    <td className={styles.tableCell}>{formatAzn(row.totalStockValue)}</td>
                    <td className={styles.tableCellMuted}>{formatShare(row.totalStockValue, totalValue)}</td>
                  </tr>
                ))
              : null}
            {hasData && !report.error && rows.length > 1 ? (
              <tr className={styles.tableFootRow}>
                <td className={styles.tableCell}>Cəmi</td>
                <td className={styles.tableCell}>{totalQuantity}</td>
                <td className={styles.tableCell}>{formatAzn(totalValue)}</td>
                <td className={styles.tableCell}>100%</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </section>
  )
}
