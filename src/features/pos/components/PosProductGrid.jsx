import { cn } from '@/lib/cn'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'
import { PosBarcodeMark } from '@/features/pos/components/PosBarcodeMark'

export function PosProductGrid({ products, storeId, onAdd }) {
  if (!storeId) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-white/50">
        Kassanı açmaq üçün mağaza seçin. Sonra barkodu oxudun və ya məhsula toxunun.
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-white/50">
        Bu axtarışa uyğun məhsul yoxdur.
      </div>
    )
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
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs tracking-wide text-white/45">{product.sku}</p>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/70">
                Stok {product.stock}
              </span>
            </div>
            <p className="text-lg font-semibold leading-tight">{product.name}</p>
            <PosBarcodeMark code={product.barcode} />
            <p className="text-2xl font-semibold tracking-tight text-emerald-300">{formatAzn(product.unitPrice)}</p>
          </button>
        )
      })}
    </div>
  )
}
