import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { DekontSheet } from '@/components/dekont/DekontSheet'
import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

function PrintIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M7 14h10v6H7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M12 11v6M9.5 14.5 12 17l2.5-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Report preview: a dark glass panel with its own header (title left, Yazdır / PDF / close right) above the white
// paper, which scrolls on its own. The whole dialog is screen-only; DekontPrintRoot is what prints.
export function DekontPreview({ title, dekont, onClose, onPrint, onPdf }) {
  useEffect(() => {
    if (!dekont) {
      return undefined
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dekont, onClose])

  if (!dekont) {
    return null
  }

  return createPortal(
    <div className={styles.dekontOverlay} onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dekont-preview-title"
        className={cn(
          styles.dekontSheet,
          dekont.table?.columns.length > 4
            ? styles.dekontSheetXWide
            : dekont.table
              ? styles.dekontSheetWide
              : styles.dekontSheetNarrow,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.dekontHeader}>
          <h2 id="dekont-preview-title" className={styles.dekontTitle}>
            {title}
          </h2>
          <div className={styles.dekontHeaderActions}>
            {onPrint ? (
              <button type="button" className={styles.dekontHeaderButton} onClick={onPrint}>
                <PrintIcon />
                Yazdır
              </button>
            ) : null}
            {onPdf ? (
              <button type="button" className={styles.dekontHeaderButton} onClick={onPdf}>
                <PdfIcon />
                PDF
              </button>
            ) : null}
            <button type="button" className={styles.dekontClose} onClick={onClose} aria-label="Bağla" title="Bağla">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>
        <div className={styles.dekontBody}>
          <div className={styles.dekontPaperFrame}>
            <DekontSheet dekont={dekont} />
          </div>
        </div>
      </section>
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
