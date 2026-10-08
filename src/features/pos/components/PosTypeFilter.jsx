import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

export function PosTypeFilter({ types, value, onChange }) {
  return (
    <div className={styles.posStoreRow}>
      <button
        type="button"
        className={cn(styles.posStoreChip, value === '' ? styles.posStoreChipActive : styles.posStoreChipIdle)}
        onClick={() => onChange('')}
      >
        Hamısı
      </button>
      {types.map((type) => (
        <button
          key={type.id}
          type="button"
          className={cn(styles.posStoreChip, value === type.id ? styles.posStoreChipActive : styles.posStoreChipIdle)}
          onClick={() => onChange(type.id)}
        >
          {type.name}
        </button>
      ))}
    </div>
  )
}
