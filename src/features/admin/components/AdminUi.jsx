import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

// Small building blocks of the admin portal, styled for its dark glass theme.

export function AdminPage({ title, description, action, children }) {
  return (
    <section className={styles.adminPage}>
      <header className={styles.adminPageHeader}>
        <div>
          <h1 className={styles.adminPageTitle}>{title}</h1>
          {description ? <p className={styles.adminPageDescription}>{description}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

const kpiTones = {
  default: styles.adminKpiValue,
  positive: styles.adminKpiValuePositive,
  warning: styles.adminKpiValueWarning,
  negative: styles.adminKpiValueNegative,
}

// Headline number; '…' until the first value arrives, the old value dimmed while refreshing.
export function AdminKpi({ label, value, hint, tone = 'default', isLoading = false }) {
  const hasValue = value !== null && value !== undefined

  return (
    <div className={styles.adminCard} aria-busy={isLoading}>
      <p className={styles.adminKpiLabel}>{label}</p>
      <p className={hasValue ? kpiTones[tone] : styles.adminKpiValueMuted} style={isLoading && hasValue ? { opacity: 0.5 } : undefined}>
        {hasValue ? value : '…'}
      </p>
      {hint ? <p className={styles.adminKpiHint}>{hint}</p> : null}
    </div>
  )
}

const badgeTones = {
  success: styles.adminBadgeSuccess,
  muted: styles.adminBadgeMuted,
  warning: styles.adminBadgeWarning,
  danger: styles.adminBadgeDanger,
  platform: styles.adminBadgePlatform,
}

export function AdminBadge({ tone = 'muted', children }) {
  return <span className={cn(styles.adminBadge, badgeTones[tone])}>{children}</span>
}

export function AdminError({ message, onRetry }) {
  return (
    <div className={styles.adminError}>
      <span>{message}</span>
      {onRetry ? (
        <button type="button" className={styles.adminTextAction} onClick={() => onRetry()}>
          Yenidən cəhd et
        </button>
      ) : null}
    </div>
  )
}

export function AdminLoading() {
  return (
    <div className={styles.adminLoading}>
      <Spinner />
      Yüklənir…
    </div>
  )
}

export function AdminChips({ options, value, onChange, label }) {
  return (
    <div className={styles.adminChipRow} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={option.id === value}
          className={cn(styles.adminChip, option.id === value ? styles.adminChipActive : styles.adminChipIdle)}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

// Glass dialog. Escape and a click on the backdrop close it; `width` is 'wide' or 'narrow'.
export function AdminModal({ title, labelId, width = 'wide', onClose, header, children }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className={styles.adminModalBackdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className={cn(styles.adminModalPanel, width === 'narrow' ? styles.adminModalNarrow : styles.adminModalWide)}
      >
        <header className={styles.adminModalHeader}>
          <div className="min-w-0">
            <h2 id={labelId} className={styles.adminModalTitle}>
              {title}
            </h2>
            {header}
          </div>
          <button type="button" aria-label="Bağla" className={styles.adminModalClose} onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}
