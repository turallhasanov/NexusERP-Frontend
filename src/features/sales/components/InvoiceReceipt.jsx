import { DekontSheet } from '@/components/dekont/DekontSheet'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { styles } from '@/lib/styles'

// Receipt panel for the selected document. `dekont` is built from the full document (with lines).
export function InvoiceReceipt({ dekont, isLoading, error, emptyText, title, onView, onPrint, onPdf }) {
  if (dekont) {
    return (
      <Card padded={false} className="overflow-hidden text-sm">
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
      </Card>
    )
  }

  return (
    <Card className="text-sm">
      <h2 className={styles.sectionTitle}>{title}</h2>
      {isLoading ? (
        <div className={styles.loadingRow}>
          <Spinner />
          Yüklənir…
        </div>
      ) : (
        <p className={error ? styles.formError : styles.pageDescription}>{error || emptyText}</p>
      )}
    </Card>
  )
}
