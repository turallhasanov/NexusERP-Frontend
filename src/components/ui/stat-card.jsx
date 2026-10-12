import { Card } from '@/components/ui/card'
import { styles } from '@/lib/styles'

const toneStyles = {
  default: styles.summaryValue,
  positive: styles.summaryValuePositive,
  negative: styles.summaryValueNegative,
  warning: styles.summaryValueWarning,
}

// Headline number. While loading with no value yet it shows a placeholder; while refreshing it keeps the
// old value, dimmed, so the layout does not jump.
export function StatCard({ label, value, tone = 'default', hint, isLoading = false }) {
  const hasValue = value !== null && value !== undefined

  return (
    <Card aria-busy={isLoading}>
      <p className={styles.summaryLabel}>{label}</p>
      <p className={hasValue ? toneStyles[tone] : styles.summaryValueMuted} style={isLoading && hasValue ? { opacity: 0.5 } : undefined}>
        {hasValue ? value : '…'}
      </p>
      {hint ? <p className={styles.summaryHint}>{hint}</p> : null}
    </Card>
  )
}

