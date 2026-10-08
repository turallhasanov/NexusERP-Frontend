import { cn } from '@/lib/cn'
import { formatAzn } from '@/lib/money'
import { PAYMENT_CARD, PAYMENT_CASH } from '@/lib/payment'
import { styles } from '@/lib/styles'

export function PosCart({
  cart,
  error,
  notice,
  storeName,
  payment,
  tendered,
  change,
  onPaymentChange,
  onTenderedChange,
  onChangeQty,
  onClear,
  onCheckout,
}) {
  const total = cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0)
  const isCash = payment === PAYMENT_CASH

  return (
    <aside className={styles.posCart}>
      <div>
        <p className="text-xs tracking-[0.28em] text-emerald-400">QƏBZ</p>
        <p className="mt-2 text-2xl font-semibold">Səbət</p>
        <p className="mt-1 text-sm text-white/50">{storeName ?? 'Mağaza seçilməyib'}</p>
      </div>

      {cart.length === 0 ? (
        <p className="mt-10 flex-1 text-sm text-white/40">Barkod oxudun və ya məhsul seçin.</p>
      ) : (
        <ul className="mt-6 min-h-0 flex-1 overflow-auto">
          {cart.map((line) => (
            <li key={line.productId} className={styles.posCartLine}>
              <div className="min-w-0">
                <p className="truncate">{line.name}</p>
                <p className="mt-1 font-mono text-[11px] tracking-widest text-white/40">{line.barcode}</p>
                <p className="mt-1 text-white/50">{formatAzn(line.unitPrice)}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <p className="font-semibold">{formatAzn(line.quantity * line.unitPrice)}</p>
                <div className="flex items-center gap-2">
                  <button type="button" className={styles.posQtyButton} onClick={() => onChangeQty(line.productId, -1)}>
                    −
                  </button>
                  <span className="w-5 text-center">{line.quantity}</span>
                  <button type="button" className={styles.posQtyButton} onClick={() => onChangeQty(line.productId, 1)}>
                    +
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto space-y-3 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-white/45">{itemCount} məhsul</p>
            <p className="mt-1 text-sm text-white/45">Cəmi</p>
          </div>
          <p className="text-3xl font-semibold tracking-tight">{formatAzn(total)}</p>
        </div>
        {error ? <p className="text-sm text-amber-300">{error}</p> : null}
        {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}
        <div className={styles.posPayRow}>
          <button
            type="button"
            className={cn(styles.posStoreChip, isCash ? styles.posStoreChipActive : styles.posStoreChipIdle)}
            onClick={() => onPaymentChange(PAYMENT_CASH)}
          >
            Nağd
          </button>
          <button
            type="button"
            className={cn(styles.posStoreChip, payment === PAYMENT_CARD ? styles.posStoreChipActive : styles.posStoreChipIdle)}
            onClick={() => onPaymentChange(PAYMENT_CARD)}
          >
            Kart
          </button>
        </div>
        {isCash ? (
          <div className={styles.posTender}>
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-white/45">Verilən</span>
              <input
                type="number"
                min={0}
                step="0.01"
                className={styles.posTenderInput}
                value={tendered}
                onChange={(event) => onTenderedChange(event.target.value)}
                placeholder="0.00"
              />
            </label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/45">Qalıq</span>
              <span className="text-lg font-semibold">{change == null ? '—' : formatAzn(change)}</span>
            </div>
          </div>
        ) : null}
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
