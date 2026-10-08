import { createPortal } from 'react-dom'
import { DekontSheet } from '@/components/dekont/DekontSheet'
import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

export function DekontPreview({ title, dekont, onClose, onPrint, onPdf }) {
  if (!dekont) {
    return null
  }

  return createPortal(
    <div className={styles.dekontOverlay} onClick={onClose}>
      <div
        className={cn(
          styles.dekontSheet,
          dekont.table ? styles.dekontSheetWide : styles.dekontSheetNarrow,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-white">{title}</h2>
          <div className="flex flex-wrap gap-4">
            {onPrint ? (
              <button type="button" className="text-sm text-white/70 hover:text-white" onClick={onPrint}>
                Yazdır
              </button>
            ) : null}
            {onPdf ? (
              <button type="button" className="text-sm text-white/70 hover:text-white" onClick={onPdf}>
                PDF
              </button>
            ) : null}
            <button type="button" className="text-sm text-white/70 hover:text-white" onClick={onClose}>
              Bağla
            </button>
          </div>
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
