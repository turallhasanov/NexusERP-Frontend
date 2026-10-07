import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

export function PosCart({ cart, error, notice, storeName, onChangeQty, onClear, onCheckout }) {
  const total = cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)

  return (
    <aside className={styles.posCart}>
      <p className={styles.sectionTitle}>Səbət</p>
      <p className="mt-1 text-sm text-neutral-400">{storeName ?? 'Mağaza seçilməyib'}</p>

      {cart.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-400">Məhsul seçin.</p>
      ) : (
        <ul className="mt-4">
          {cart.map((line) => (
            <li key={line.productId} className={styles.posCartLine}>
              <div>
                <p>{line.name}</p>
                <p className="text-neutral-400">{formatAzn(line.unitPrice)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className={styles.posQtyButton} onClick={() => onChangeQty(line.productId, -1)}>
                  −
                </button>
                <span>{line.quantity}</span>
                <button type="button" className={styles.posQtyButton} onClick={() => onChangeQty(line.productId, 1)}>
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 space-y-3">
        <div className={styles.definitionRow}>
          <span className="text-neutral-400">Cəmi</span>
          <span className={styles.sectionTitle}>{formatAzn(total)}</span>
        </div>
        {error ? <p className="text-sm text-amber-300">{error}</p> : null}
        {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}
        <button type="button" className={styles.posPayButton} onClick={onCheckout}>
          Satışı tamamla
        </button>
        <button type="button" className={styles.posGhostButton} onClick={onClear}>
          Səbəti təmizlə
        </button>
      </div>
    </aside>
  )
}
