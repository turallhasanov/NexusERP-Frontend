import { DekontSheet } from '@/components/dekont/DekontSheet'
import { Card } from '@/components/ui/card'
import { buildSalesDekont } from '@/features/sales/api/sales-dekont'
import { styles } from '@/lib/styles'

export function InvoiceReceipt({ order, onView, onPrint, onPdf }) {
  const dekont = order ? buildSalesDekont(order) : null

  return (
    <Card padded={false} className="overflow-hidden text-sm">
      {dekont ? (
        <>
          <DekontSheet dekont={dekont} />
          <div className={`border-t border-neutral-200 px-8 pb-6 ${styles.dekontActions}`}>
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
        <div className="p-4">
          <h2 className={styles.sectionTitle}>Satış dekontu</h2>
          <p className={styles.pageDescription}>Dekont üçün əvvəlcə sifariş yazın.</p>
        </div>
      )}
    </Card>
  )
}
