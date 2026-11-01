import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { DekontPreview, DekontPrintRoot } from '@/components/dekont/DekontPreview'
import { approveSale } from '@/features/sales/api/approve-sale'
import { cancelSale } from '@/features/sales/api/cancel-sale'
import { fetchSale } from '@/features/sales/api/fetch-sale'
import { buildSalesDekont, openSalesDekontPdf } from '@/features/sales/api/sales-dekont'
import { InvoiceReceipt } from '@/features/sales/components/InvoiceReceipt'
import { OrderForm } from '@/features/sales/components/OrderForm'
import { OrderTable } from '@/features/sales/components/OrderTable'
import { useOrders } from '@/features/sales/api/use-orders'
import { useDocumentDetail } from '@/hooks/use-document-detail'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { cn } from '@/lib/cn'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'
import { isCompanyManager } from '@/types/auth'
import { useAuthStore } from '@/store/auth-store'
import { CHANNEL_ONLINE, SALE_CANCELLED } from '@/store/orders-store'
import { showToast } from '@/store/toast-store'

const FILTER_ALL = 'all'
const FILTER_ONLINE = 'online'
const FILTER_CANCELLED = 'cancelled'

const FILTERS = [
  { id: FILTER_ALL, label: 'Bütün satışlar' },
  { id: FILTER_ONLINE, label: 'Online sifarişlər (Khazar)' },
  { id: FILTER_CANCELLED, label: 'Ləğv edilmişlər' },
]

const EMPTY_TEXTS = {
  [FILTER_ALL]: 'Hələ satış yoxdur.',
  [FILTER_ONLINE]: 'Khazar-dan hələ online sifariş gəlməyib.',
  [FILTER_CANCELLED]: 'Ləğv edilmiş sifariş yoxdur.',
}

export function SalesPage() {
  const { orders, draftOrders, approvedOrders, isLoading, error, reload } = useOrders()
  const [selectedId, setSelectedId] = useState('')
  const [preview, setPreview] = useState(false)
  const [approvingId, setApprovingId] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const { user } = useAuthStore()
  // Company admins and IT admins only; the API enforces the same roles on DELETE /api/sales/{id}.
  const canDelete = isCompanyManager(user)
  const [filter, setFilter] = useState(FILTER_ALL)
  // Cancelled orders are hidden from every view except their own filter.
  const activeOrders = orders.filter((order) => order.status !== SALE_CANCELLED)
  const onlineOrders = activeOrders.filter((order) => order.channel === CHANNEL_ONLINE)
  const shownOrders =
    filter === FILTER_CANCELLED
      ? orders.filter((order) => order.status === SALE_CANCELLED)
      : filter === FILTER_ONLINE
        ? onlineOrders
        : activeOrders
  const selectedOrder = orders.find((order) => order.id === selectedId) ?? shownOrders[0]
  const detail = useDocumentDetail(fetchSale, selectedOrder?.id, selectedOrder?.status)
  const dekont = detail.document ? buildSalesDekont(detail.document) : null
  useDocumentTitle('Satış')

  function viewOrder(orderId) {
    setSelectedId(orderId)
    setPreview(true)
  }

  function viewPdf() {
    if (!detail.document) {
      return
    }

    void openSalesDekontPdf(detail.document)
    setPreview(true)
  }

  async function handleDelete(order) {
    if (!window.confirm('Bu satışı ləğv etmək və stokları bərpa etmək istədiyinizdən əminsiniz?')) {
      return
    }

    setDeletingId(order.id)
    const result = await cancelSale(order.id)
    setDeletingId('')

    if (!result.ok) {
      showToast(result.error, 'error')
      return
    }

    // The order is now cancelled, so it drops out of the default views and is listed under "Ləğv edilmişlər".
    showToast(`Satış ləğv edildi: ${order.number}`)
  }

  async function handleApprove(order) {
    setApprovingId(order.id)
    const result = await approveSale(order.id)
    setApprovingId('')

    if (!result.ok) {
      showToast(result.error, 'error')
      return
    }

    setSelectedId(order.id)
    showToast(`Satış təsdiqləndi: ${order.number}`)
  }

  return (
    <PageContainer
      title="Satış"
      description="Satış qaimələri: qaralama yazılır, təsdiqləndikdə anbardan silinir."
      action={
        <Link to={routes.pos} className={styles.buttonPrimary}>
          POS kassa
        </Link>
      }
    >
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Qaralama</p>
          <p className={styles.summaryValue}>{isLoading ? '…' : draftOrders}</p>
        </Card>
        <Card>
          <p className={styles.summaryLabel}>Təsdiqlənib</p>
          <p className={styles.summaryValue}>{isLoading ? '…' : approvedOrders}</p>
        </Card>
        <Card>
          <p className={styles.summaryLabel}>Online sifariş (Khazar)</p>
          <p className={styles.summaryValue}>{isLoading ? '…' : onlineOrders.length}</p>
        </Card>
      </div>
      <div className={styles.salesLayout}>
        <OrderForm onCreated={(order) => setSelectedId(order.id)} />
        <InvoiceReceipt
          title="Satış qaiməsi"
          dekont={dekont}
          isLoading={detail.isLoading}
          error={detail.error}
          emptyText="Qaimə üçün əvvəlcə satış yazın."
          onView={() => setPreview(true)}
          onPrint={() => window.print()}
          onPdf={viewPdf}
        />
      </div>
      <div className={styles.periodRow} role="group" aria-label="Satış filtri">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            className={cn(styles.periodChip, filter === item.id ? styles.periodChipActive : styles.periodChipIdle)}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <OrderTable
        orders={shownOrders}
        emptyText={EMPTY_TEXTS[filter]}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        onView={viewOrder}
        onApprove={handleApprove}
        approvingId={approvingId}
        canDelete={canDelete}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
      {preview ? (
        <DekontPreview
          title="Satış qaiməsi"
          dekont={dekont}
          onClose={() => setPreview(false)}
          onPrint={() => window.print()}
          onPdf={viewPdf}
        />
      ) : null}
      <DekontPrintRoot dekont={dekont} />
    </PageContainer>
  )
}
