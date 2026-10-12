import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { TableState } from '@/components/ui/table-state'
import { PeriodFilter } from '@/features/finance/components/PeriodFilter'
import { fetchTopProducts } from '@/features/reports/api/reports-api'
import { useApiQuery } from '@/hooks/use-api-query'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const SORT_OPTIONS = [
  { id: 'quantity', label: 'Satış həcmi' },
  { id: 'revenue', label: 'Gəlir' },
]

const LIMIT_OPTIONS = [5, 10, 20]

const TABLE_COLUMNS = ['#', 'Məhsul', 'Satılan miqdar', 'Gəlir']

export function TopProductsReport() {
  const [sortBy, setSortBy] = useState('quantity')
  const [limit, setLimit] = useState(10)
  const report = useApiQuery(fetchTopProducts, { sortBy, limit })
  const rows = report.data ?? []
  const hasData = report.data !== null

  return (
    <section className="space-y-4" aria-labelledby="top-products-title">
      <div className={styles.sectionHeader}>
        <h2 id="top-products-title" className={styles.sectionTitle}>
          Ən çox satılan məhsullar {report.isLoading && hasData ? <Spinner className="ml-2 align-middle" /> : null}
        </h2>
        <div className={styles.toolbar}>
          <PeriodFilter value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            Say
            <select className={styles.input} value={limit} onChange={(event) => setLimit(Number(event.target.value))} aria-label="Məhsul sayı">
              {LIMIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
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
              emptyText="Hələ təsdiqlənmiş satış yoxdur."
            />
            {hasData && !report.error
              ? rows.map((row, index) => (
                  <tr key={row.productId} className={styles.tableRow}>
                    <td className={styles.tableCellMuted}>{index + 1}</td>
                    <td className={styles.tableCell}>{row.productName}</td>
                    <td className={sortBy === 'quantity' ? styles.tableCell : styles.tableCellMuted}>{row.quantitySold}</td>
                    <td className={sortBy === 'revenue' ? styles.tableCell : styles.tableCellMuted}>{formatAzn(row.revenue)}</td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </Card>
      <p className={styles.summaryHint}>Bütün dövr üzrə, yalnız təsdiqlənmiş satışlar.</p>
    </section>
  )
}
