import { Card } from '@/components/ui/card'
import { TableState } from '@/components/ui/table-state'
import { formatMargin } from '@/features/finance/api/finance-summary'
import { FinanceReportActions } from '@/features/finance/components/FinanceReportActions'
import { cn } from '@/lib/cn'
import { formatPeriod, periodColumn } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

// Rows of GET /api/finance/mizan: the same profit and loss as the cards, one row per day, month or year.
export function MizanTable({ mizan, period, onView, onPrint, onPdf }) {
  const columns = [periodColumn(period), 'Mədaxil', 'Maya dəyəri', 'Xərclər', 'Maaş', 'Qalıq', 'Marja']
  const rows = mizan.data?.rows ?? []

  return (
    <Card padded={false}>
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <h2 className={styles.sectionTitle}>Mizan hesabatı</h2>
        <FinanceReportActions onView={onView} onPrint={onPrint} onPdf={onPdf} />
      </div>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            {columns.map((column) => (
              <th key={column} className={styles.tableHeadCell}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <TableState
            colSpan={columns.length}
            isLoading={mizan.isLoading && !mizan.data}
            error={mizan.data ? '' : mizan.error}
            onRetry={mizan.reload}
            isEmpty={rows.length === 0}
            emptyText="Hələ mizan hesabatı yoxdur."
          />
          {rows.map((row) => (
            <tr key={row.key} className={styles.tableRow}>
              <td className={styles.tableCell}>{formatPeriod(row.key, period)}</td>
              <td className={styles.tableCell}>{formatAzn(row.totals.revenue)}</td>
              <td className={styles.tableCellMuted}>{formatAzn(row.totals.costOfGoodsSold)}</td>
              <td className={styles.tableCellMuted}>{formatAzn(row.totals.operatingExpenses)}</td>
              <td className={styles.tableCellMuted}>{formatAzn(row.totals.payroll)}</td>
              <td className={cn(styles.tableCell, row.totals.netProfit < 0 ? styles.textLoss : styles.textGain)}>
                {formatAzn(row.totals.netProfit)}
              </td>
              <td className={styles.tableCellMuted}>{formatMargin(row.totals.profitMargin)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
