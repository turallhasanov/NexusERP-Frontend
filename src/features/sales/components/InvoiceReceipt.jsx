import { Card } from '@/components/ui/card'
import { styles } from '@/lib/styles'

const INVOICE_ROWS = [
  { label: 'Qaimə №', value: 'SAT-2026-001' },
  { label: 'Kontragent', value: 'Nümunə Ticarət MMC' },
  { label: 'Məbləğ', value: '4.250,00 ₼' },
]

export function InvoiceReceipt() {
  return (
    <Card className="text-sm">
      <h2 className={styles.sectionTitle}>Son qaimə qaralaması</h2>
      <dl className={styles.definitionList}>
        {INVOICE_ROWS.map((row) => (
          <div key={row.label} className={styles.definitionRow}>
            <dt>{row.label}</dt>
            <dd className={styles.definitionValue}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
