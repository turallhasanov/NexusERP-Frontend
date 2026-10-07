import { cn } from '@/lib/cn'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

export function PosProductGrid({ products, storeId, onAdd }) {
  if (!storeId) {
    return <p className={styles.pageDescription}>Kassanı açmaq üçün mağaza seçin.</p>
  }

  if (products.length === 0) {
    return <p className={styles.pageDescription}>Kataloqda məhsul yoxdur.</p>
  }

  return (
    <div className={styles.posGrid}>
      {products.map((product) => {
        const disabled = product.stock < 1

        return (
          <button
            key={product.id}
            type="button"
            disabled={disabled}
            className={cn(styles.posTile, disabled ? styles.posTileMuted : styles.posTileIdle)}
            onClick={() => onAdd(product)}
          >
            <p className={styles.summaryLabel}>{product.sku}</p>
            <p className={styles.sectionTitle}>{product.name}</p>
            <div className={styles.definitionRow}>
              <span className={styles.summaryLabel}>Stok {product.stock}</span>
              <span className={styles.sectionTitle}>{formatAzn(product.unitPrice)}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
