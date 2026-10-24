import { useEffect, useRef } from 'react'
import { NexusMark } from '@/components/brand/NexusMark'
import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

const FEATURES = [
  {
    title: 'Mərkəzləşdirilmiş idarəetmə',
    text: 'Bütün mağazaları, anbarları və satış kanallarını tək bir ekrandan real vaxt rejimində (real-time) izləmə və idarəetmə imkanı.',
  },
  {
    title: 'Avtomatik stok və satış inteqrasiyası',
    text: 'E-ticarət platformalarından və fiziki mağazalardan daxil olan sifarişlərin və anbar qalıqlarının anında avtomatik yenilənməsi.',
  },
  {
    title: 'Çoxşirkətli və çoxmağazalı dəstək (Multi-Tenant)',
    text: 'Müxtəlif brendləri, filialları və anbarları tam təhlükəsiz və ayrılmış strukturda mərkəzdən idarə etmə imkanı.',
  },
  {
    title: 'Analitika və hesabatlılıq',
    text: 'Biznesin inkişafı, satış dinamikası və anbar dövriyyəsi haqqında dəqiq analitik hesabatların əldə edilməsi.',
  },
]

const PRODUCT_DETAILS = [
  { label: 'Məhsul', value: 'NexusERP Enterprise Edition' },
  { label: 'Versiya', value: 'v1.0.0' },
]

// Glass "about NexusERP" dialog over the splash: what an ERP is and what NexusERP offers a business. The copy is fixed;
// GET /api/system/info only drives the server status line and the copyright. Clicks inside never reach
// the splash (which would start sign-in); the backdrop, X and Escape close it.
export function SplashInfoModal({ info, open, onClose, onEnter }) {
  const enterRef = useRef(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }

    enterRef.current?.focus()

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  function handleBackdropClick(event) {
    event.stopPropagation()
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={styles.splashModalBackdrop}
      data-open={open}
      onClick={handleBackdropClick}
      onKeyDown={(event) => event.stopPropagation()}
      inert={!open}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="splash-info-title"
        className={styles.splashModalPanel}
      >
        <header className={styles.splashModalHeader}>
          <NexusMark className={styles.brandMarkLg} />
          <div className={styles.splashModalHeading}>
            <h2 id="splash-info-title" className={styles.splashModalTitle}>
              NexusERP — Korporativ Resursların Planlaşdırılması Sistemi
            </h2>
          </div>
          <button type="button" data-cursor="action" aria-label="Bağla" className={styles.splashModalClose} onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <p className={styles.splashModalLead}>
          <strong className={styles.splashModalLeadTerm}>ERP (Enterprise Resource Planning)</strong> — bir müəssisənin
          bütün biznes proseslərini, anbar, satış, təchizat zənciri, finans və müştəri münasibətlərini tək bir mərkəzi
          platformadan effektiv idarə etməyə imkan verən korporativ idarəetmə sistemidir.
        </p>

        <div className={styles.splashModalGrid}>
          {FEATURES.map((feature) => (
            <InfoCard key={feature.title} title={feature.title}>
              <p>{feature.text}</p>
            </InfoCard>
          ))}

          <InfoCard title="Versiya məlumatı" wide>
            <dl className={styles.splashModalMeta}>
              {PRODUCT_DETAILS.map((detail) => (
                <div key={detail.label} className={styles.splashModalMetaRow}>
                  <dt className={styles.splashModalMetaLabel}>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.splashModalStatus}>
              <span className={cn(styles.splashModalStatusDot, info ? styles.splashModalStatusOnline : styles.splashModalStatusOffline)} />
              {info ? 'Server onlayndır' : 'Serverə qoşulmaq mümkün olmadı'}
            </p>
            {info?.copyright ? <p className={styles.splashModalMuted}>{info.copyright}</p> : null}
          </InfoCard>
        </div>

        <footer className={styles.splashModalActions}>
          <button ref={enterRef} type="button" data-cursor="action" className={styles.splashModalPrimary} onClick={onEnter}>
            Giriş Səhifəsinə Keç
          </button>
        </footer>
      </section>
    </div>
  )
}

function InfoCard({ title, wide, children }) {
  return (
    <div className={cn(styles.splashModalCard, wide && styles.splashModalCardWide)}>
      <h3 className={styles.splashModalCardTitle}>{title}</h3>
      <div className={styles.splashModalCardBody}>{children}</div>
    </div>
  )
}
