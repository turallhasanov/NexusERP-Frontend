import { Card } from '@/components/ui/card.tsx'
import { styles } from '@/lib/styles.ts'

const INVOICE_ROWS = [
  { label: 'Qaimə №', value: 'SAT-2026-001' },
  { label: 'Kontragent', value: 'Nümunə Ticarət MMC' },
  { label: 'Məbləğ', value: '4.250,00 ₼' },
] as const

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
