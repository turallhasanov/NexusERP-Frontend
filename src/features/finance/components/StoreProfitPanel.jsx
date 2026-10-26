import { Card } from '@/components/ui/card'
import { TableState } from '@/components/ui/table-state'
import { formatMargin } from '@/features/finance/api/finance-summary'
import { FinanceReportActions } from '@/features/finance/components/FinanceReportActions'
import { cn } from '@/lib/cn'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const COLUMNS = ['Mağaza', 'Mədaxil', 'Maya dəyəri', 'Xərclər', 'Maaş', 'Xalis nəticə', 'Marja']

// Green "Mənfəət: +X ₼" or red "Zərər: −X ₼", with the margin.
function ProfitIndicator({ totals }) {
  const net = totals.netProfit
  const isLoss = net < 0

  return (
    <div className={cn(styles.profitIndicator, isLoss ? styles.profitIndicatorLoss : styles.profitIndicatorGain)}>
      <span className={styles.profitIndicatorValue}>
        {isLoss ? 'Zərər' : 'Mənfəət'}: {isLoss ? '−' : '+'}
        {formatAzn(Math.abs(net))}
      </span>
      <span className={styles.profitIndicatorMargin}>Marja: {formatMargin(totals.profitMargin)}</span>
    </div>
  )
}

function Breakdown({ items }) {
  return (
    <ul className={styles.profitBreakdown}>
      {items.map(([label, value]) => (
        <li key={label} className={styles.profitBreakdownRow}>
          <span>{label}</span>
          <span className="tabular-nums">{formatAzn(value)}</span>
        </li>
      ))}
    </ul>
  )
}

// Store profit and loss from GET /api/finance/summary: store picker, cards and the per-store mizan table.
export function StoreProfitPanel({ stores, storeId, onStoreChange, summary, onView, onPrint, onPdf }) {
  const totals = summary.data?.totals
  const rows = summary.data?.stores ?? []

  return (
    <section className="space-y-4">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Mağaza üzrə mənfəət və zərər</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className={styles.input}
            value={storeId}
            onChange={(event) => onStoreChange(event.target.value)}
            aria-label="Mağaza"
          >
            <option value="">Bütün mağazalar</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <FinanceReportActions onView={onView} onPrint={onPrint} onPdf={onPdf} />
        </div>
      </div>

      {totals ? (
        <>
          <ProfitIndicator totals={totals} />
          <div className={styles.summaryGrid} aria-busy={summary.isLoading}>
            <Card>
              <p className={styles.summaryLabel}>Mədaxil (satış gəliri)</p>
              <p className={styles.summaryValue}>{formatAzn(totals.revenue)}</p>
              <Breakdown
                items={[
                  ['POS (pərakəndə)', totals.posRevenue],
                  ['Toptan', totals.wholesaleRevenue],
                  ['Khazar online', totals.onlineRevenue],
                ]}
              />
            </Card>
            <Card>
              <p className={styles.summaryLabel}>Məxaric</p>
              <p className={styles.summaryValue}>{formatAzn(totals.totalExpenses)}</p>
              <Breakdown
                items={[
                  ['Satılan malın maya dəyəri', totals.costOfGoodsSold],
                  ['Əməliyyat xərcləri', totals.operatingExpenses],
                  ['İşçi maaşları', totals.payroll],
                ]}
              />
            </Card>
            <Card>
              <p className={styles.summaryLabel}>Qalıq / xalis mənfəət</p>
              <p className={totals.netProfit < 0 ? styles.summaryValueNegative : styles.summaryValuePositive}>
                {formatAzn(totals.netProfit)}
              </p>
              <p className={styles.summaryHint}>Mədaxil − Məxaric · Marja {formatMargin(totals.profitMargin)}</p>
            </Card>
          </div>
        </>
      ) : null}

      <Card padded={false}>
        <div className="px-4 py-3">
          <h3 className={styles.sectionTitle}>Mağaza mizan hesabatı</h3>
        </div>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              {COLUMNS.map((column) => (
                <th key={column} className={styles.tableHeadCell}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TableState
              colSpan={COLUMNS.length}
              isLoading={summary.isLoading && !summary.data}
              error={summary.data ? '' : summary.error}
              onRetry={summary.reload}
              isEmpty={rows.length === 0}
              emptyText="Hələ mağaza yoxdur."
            />
            {rows.map((row) => (
              <tr key={row.storeId ?? 'unassigned'} className={styles.tableRow}>
                <td className={row.storeId ? styles.tableCell : styles.tableCellMuted}>{row.name}</td>
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
        <p className={cn(styles.fieldHint, 'px-4 py-3')}>
          Maya dəyəri: satılan malın məhsulun cari alış qiyməti ilə dəyəri. Xərclər və maaşlar mağazaya təyin
          olunduqda həmin mağazaya düşür; təyin olunmayanlar «Mağazaya aid olmayan» sətrindədir.
        </p>
      </Card>
    </section>
  )
}
