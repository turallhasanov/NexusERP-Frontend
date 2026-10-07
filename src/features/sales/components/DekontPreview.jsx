import { createPortal } from 'react-dom'
import { DekontSheet } from '@/features/sales/components/DekontSheet'
import { styles } from '@/lib/styles'

export function DekontPreview({ order, onClose }) {
  if (!order) {
    return null
  }

  return createPortal(
    <div className={styles.dekontOverlay} onClick={onClose}>
      <div
        className={styles.dekontSheet}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className={styles.sectionTitle}>Satış dekontu</h2>
          <button type="button" className={styles.headerAction} onClick={onClose}>
            Bağla
          </button>
        </div>
        <DekontSheet order={order} />
      </div>
    </div>,
    document.body,
  )
}

export function DekontPrintRoot({ order }) {
  if (!order) {
    return null
  }

  return createPortal(
    <div className={styles.dekontPrintRoot}>
      <DekontSheet order={order} />
    </div>,
    document.body,
  )
}
