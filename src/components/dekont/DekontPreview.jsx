import { createPortal } from 'react-dom'
import { DekontSheet } from '@/components/dekont/DekontSheet'
import { styles } from '@/lib/styles'

export function DekontPreview({ title, dekont, onClose }) {
  if (!dekont) {
    return null
  }

  return createPortal(
    <div className={styles.dekontOverlay} onClick={onClose}>
      <div
        className={styles.dekontSheet}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className={styles.sectionTitle}>{title}</h2>
          <button type="button" className={styles.headerAction} onClick={onClose}>
            Bağla
          </button>
        </div>
        <DekontSheet dekont={dekont} />
      </div>
    </div>,
    document.body,
  )
}

export function DekontPrintRoot({ dekont }) {
  if (!dekont) {
    return null
  }

  return createPortal(
    <div className={styles.dekontPrintRoot}>
      <DekontSheet dekont={dekont} />
    </div>,
    document.body,
  )
}
