import { cn } from '@/lib/cn'
import { PERIODS } from '@/lib/date'
import { styles } from '@/lib/styles'

export function PeriodFilter({ value, onChange }) {
  return (
    <div className={styles.periodRow}>
      {PERIODS.map((period) => (
        <button
          key={period.id}
          type="button"
          className={cn(styles.periodChip, value === period.id ? styles.periodChipActive : styles.periodChipIdle)}
          onClick={() => onChange(period.id)}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}
