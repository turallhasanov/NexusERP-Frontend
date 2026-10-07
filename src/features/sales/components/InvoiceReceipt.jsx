import { Card } from '@/components/ui/card'
import { buildSalesDekont } from '@/features/sales/api/sales-dekont'
import { styles } from '@/lib/styles'

export function InvoiceReceipt({ order, onView, onPrint, onPdf }) {
  const dekont = order ? buildSalesDekont(order) : null

  return (
    <Card className="text-sm">
      <h2 className={styles.sectionTitle}>Satış dekontu</h2>
      {dekont ? (
        <>
          <dl className={styles.definitionList}>
            {dekont.rows.map((row) => (
              <div key={row.label} className={styles.definitionRow}>
                <dt>{row.label}</dt>
                <dd className={styles.definitionValue}>{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.dekontActions}>
            <button type="button" className={styles.headerAction} onClick={onView}>
              Bax
            </button>
            <button type="button" className={styles.headerAction} onClick={onPrint}>
              Yazdır
            </button>
            <button type="button" className={styles.headerAction} onClick={onPdf}>
              PDF
            </button>
          </div>
        </>
      ) : (
        <p className={styles.pageDescription}>Dekont üçün əvvəlcə sifariş yazın.</p>
      )}
    </Card>
  )
}
