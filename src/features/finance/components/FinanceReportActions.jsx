import { styles } from '@/lib/styles'

export function FinanceReportActions({ onView, onPrint, onPdf }) {
  return (
    <div className="flex flex-wrap gap-4">
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
  )
}
