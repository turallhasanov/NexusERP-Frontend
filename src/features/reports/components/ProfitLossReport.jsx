import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { StatCard } from '@/components/ui/stat-card'
import { PeriodFilter } from '@/features/finance/components/PeriodFilter'
import { fetchProfitLoss } from '@/features/reports/api/reports-api'
import { useApiQuery } from '@/hooks/use-api-query'
import { formatAzn } from '@/lib/money'
import { profitTone } from '@/lib/profit'
import { presetRange, RANGE_MONTH, RANGE_PRESETS, toApiRange } from '@/lib/report-range'
import { styles } from '@/lib/styles'

export function ProfitLossReport() {
  const [preset, setPreset] = useState(RANGE_MONTH)
  const [range, setRange] = useState(() => presetRange(RANGE_MONTH))
  const report = useApiQuery(fetchProfitLoss, toApiRange(range))
  const data = report.data
  const money = (amount) => (data ? formatAzn(amount) : null)

  function choosePreset(id) {
    setPreset(id)
    setRange(presetRange(id))
  }

  function changeDate(field) {
    return (event) => {
      setPreset('')
      setRange((current) => ({ ...current, [field]: event.target.value }))
    }
  }

  const isProfit = data ? data.netProfit >= 0 : null

  return (
    <section className="space-y-4" aria-labelledby="profit-loss-title">
      <div className={styles.sectionHeader}>
        <h2 id="profit-loss-title" className={styles.sectionTitle}>
          Mənfəət və zərər {report.isLoading ? <Spinner className="ml-2 align-middle" /> : null}
        </h2>
        {data ? <Badge variant={isProfit ? 'success' : 'danger'}>{isProfit ? 'Mənfəət' : 'Zərər'}</Badge> : null}
      </div>
      <div className={styles.toolbar}>
        <PeriodFilter value={preset} onChange={choosePreset} options={RANGE_PRESETS} />
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Başlanğıc</span>
          <input type="date" className={styles.dateInput} value={range.from} onChange={changeDate('from')} aria-label="Başlanğıc tarixi" />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Son</span>
          <input type="date" className={styles.dateInput} value={range.to} onChange={changeDate('to')} aria-label="Son tarix" />
        </label>
      </div>
      {report.error ? (
        <div className={styles.errorRow}>
          <span>{report.error}</span>
          <button type="button" className={styles.textAction} onClick={report.reload}>
            Yenidən cəhd et
          </button>
        </div>
      ) : null}
      <div className={styles.kpiGrid}>
        <StatCard label="Ümumi gəlir" value={money(data?.grossRevenue)} hint="Təsdiqlənmiş satışlar" isLoading={report.isLoading} />
        <StatCard
          label="Satılan malların maya dəyəri"
          value={money(data?.cogs)}
          hint="Cari alış qiyməti ilə"
          isLoading={report.isLoading}
        />
        <StatCard
          label="Yalın mənfəət"
          value={money(data?.grossProfit)}
          tone={data ? profitTone(data.grossProfit) : 'default'}
          hint="Gəlir − maya dəyəri"
          isLoading={report.isLoading}
        />
        <StatCard label="Əməliyyat xərcləri" value={money(data?.totalExpenses)} isLoading={report.isLoading} />
        <StatCard
          label="Xalis mənfəət"
          value={money(data?.netProfit)}
          tone={data ? profitTone(data.netProfit) : 'default'}
          hint="Yalın mənfəət − xərclər"
          isLoading={report.isLoading}
        />
      </div>
    </section>
  )
}
