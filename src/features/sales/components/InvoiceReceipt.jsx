import { Card } from '@/components/ui/card'
import { formatAzn } from '@/lib/money'
import { paymentLabel } from '@/lib/payment'
import { styles } from '@/lib/styles'
import { useOrdersStore } from '@/store/orders-store'

export function InvoiceReceipt() {
  const { orders } = useOrdersStore()
  const latest = orders[0]

  return (
    <Card className="text-sm">
      <h2 className={styles.sectionTitle}>Son qaimə qaralaması</h2>
      {latest ? (
        <dl className={styles.definitionList}>
          <div className={styles.definitionRow}>
            <dt>Qaimə №</dt>
            <dd className={styles.definitionValue}>{latest.number}</dd>
          </div>
          <div className={styles.definitionRow}>
            <dt>Növ</dt>
            <dd className={styles.definitionValue}>{latest.type === 'retail' ? 'Pərakəndə' : 'Toptan'}</dd>
          </div>
          <div className={styles.definitionRow}>
            <dt>Kontragent</dt>
            <dd className={styles.definitionValue}>{latest.customer}</dd>
          </div>
          <div className={styles.definitionRow}>
            <dt>VÖEN</dt>
            <dd className={styles.definitionValue}>{latest.voen}</dd>
          </div>
          <div className={styles.definitionRow}>
            <dt>Məhsul</dt>
            <dd className={styles.definitionValue}>{latest.product}</dd>
          </div>
          <div className={styles.definitionRow}>
            <dt>Depo</dt>
            <dd className={styles.definitionValue}>{latest.warehouse}</dd>
          </div>
          <div className={styles.definitionRow}>
            <dt>Mağaza</dt>
            <dd className={styles.definitionValue}>{latest.store}</dd>
          </div>
          <div className={styles.definitionRow}>
            <dt>Ödəniş</dt>
            <dd className={styles.definitionValue}>{paymentLabel(latest.payment)}</dd>
          </div>
          <div className={styles.definitionRow}>
            <dt>Məbləğ</dt>
            <dd className={styles.definitionValue}>{formatAzn(latest.total)}</dd>
          </div>
        </dl>
      ) : (
        <p className={styles.pageDescription}>Qaralama üçün əvvəlcə sifariş yazın.</p>
      )}
    </Card>
  )
}
