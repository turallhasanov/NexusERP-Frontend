import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

export function PosStorePicker({ stores, storeId, onSelect }) {
  return (
    <div className={styles.posStoreRow}>
      {stores.map((store) => (
        <button
          key={store.id}
          type="button"
          className={cn(
            styles.posStoreChip,
            store.id === storeId ? styles.posStoreChipActive : styles.posStoreChipIdle,
          )}
          onClick={() => onSelect(store.id)}
        >
          {store.name}
        </button>
      ))}
    </div>
  )
}
