import { cn } from '@/lib/cn'
import { PERIODS } from '@/lib/date'
import { styles } from '@/lib/styles'

// Chip row. `options` defaults to the finance periods (day / month / year); reports pass their own presets.
export function PeriodFilter({ value, onChange, options = PERIODS }) {
  return (
    <div className={styles.periodRow}>
      {options.map((period) => (
        <button
          key={period.id}
          type="button"
          aria-pressed={value === period.id}
          className={cn(styles.periodChip, value === period.id ? styles.periodChipActive : styles.periodChipIdle)}
          onClick={() => onChange(period.id)}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}
