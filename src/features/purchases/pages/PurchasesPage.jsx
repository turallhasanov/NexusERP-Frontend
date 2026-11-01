import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { DekontPreview, DekontPrintRoot } from '@/components/dekont/DekontPreview'
import { approvePurchase } from '@/features/purchases/api/approve-purchase'
import { cancelPurchase } from '@/features/purchases/api/cancel-purchase'
import { fetchPurchase } from '@/features/purchases/api/fetch-purchase'
import { buildPurchaseDekont, openPurchaseDekontPdf } from '@/features/purchases/api/purchase-dekont'
import { PurchaseForm } from '@/features/purchases/components/PurchaseForm'
import { PurchaseTable } from '@/features/purchases/components/PurchaseTable'
import { usePurchases } from '@/features/purchases/api/use-purchases'
import { InvoiceReceipt } from '@/features/sales/components/InvoiceReceipt'
import { useDocumentDetail } from '@/hooks/use-document-detail'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'
import { PURCHASE_CANCELLED } from '@/store/purchases-store'
import { showToast } from '@/store/toast-store'
import { isCompanyManager } from '@/types/auth'

const FILTER_ACTIVE = 'active'
const FILTER_CANCELLED = 'cancelled'

const FILTERS = [
  { id: FILTER_ACTIVE, label: 'Bütün alışlar' },
  { id: FILTER_CANCELLED, label: 'Ləğv edilmişlər' },
]

export function PurchasesPage() {
  const { purchases, draftPurchases, approvedPurchases, isLoading, error, reload } = usePurchases()
  const [selectedId, setSelectedId] = useState('')
  const [preview, setPreview] = useState(false)
  const [approvingId, setApprovingId] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [filter, setFilter] = useState(FILTER_ACTIVE)
  const { user } = useAuthStore()
  // Company admins and IT admins only; the API enforces the same roles on DELETE /api/purchases/{id}.
  const canDelete = isCompanyManager(user)
  // Cancelled purchases are hidden from the default list and shown by their own filter.
  const shownPurchases = purchases.filter((purchase) => (purchase.status === PURCHASE_CANCELLED) === (filter === FILTER_CANCELLED))
  const selectedPurchase = purchases.find((purchase) => purchase.id === selectedId) ?? shownPurchases[0]
  const detail = useDocumentDetail(fetchPurchase, selectedPurchase?.id, selectedPurchase?.status)
  const dekont = detail.document ? buildPurchaseDekont(detail.document) : null
  useDocumentTitle('Alış')

  function viewPurchase(purchaseId) {
    setSelectedId(purchaseId)
    setPreview(true)
  }

  function viewPdf() {
    if (!detail.document) {
      return
    }

    void openPurchaseDekontPdf(detail.document)
    setPreview(true)
  }

  async function handleDelete(purchase) {
    if (!window.confirm('Bu alışı ləğv etmək və malları anbardan geri götürmək istədiyinizdən əminsiniz?')) {
      return
    }

    setDeletingId(purchase.id)
    let result = await cancelPurchase(purchase.id)

    // Part of the goods is no longer in the warehouse (sold, or cleared by a stock reset): the server refused and said
    // what is missing. A second confirmation can force it, which takes only what is there and leaves the balance at zero.
    if (!result.ok && result.stockShortage) {
      const force = window.confirm(
        `${result.error}\n\nYenə də zorla ləğv etmək (stok yoxlamasını keçmək) istəyirsiniz? ` +
          'Anbarda olan qalıq sıfıra endiriləcək, çatmayan miqdar nəzərə alınmayacaq.',
      )

      if (force) {
        result = await cancelPurchase(purchase.id, { force: true })
      }
    }

    setDeletingId('')

    if (!result.ok) {
      showToast(result.error, 'error')
      return
    }

    // The purchase is now cancelled, so it drops out of the default list and is listed under "Ləğv edilmişlər".
    showToast(`Alış ləğv edildi: ${purchase.number}`)
  }

  async function handleApprove(purchase) {
    setApprovingId(purchase.id)
    const result = await approvePurchase(purchase.id)
    setApprovingId('')

    if (!result.ok) {
      showToast(result.error, 'error')
      return
    }

    setSelectedId(purchase.id)
    showToast(`Alış təsdiqləndi: ${purchase.number}`)
  }

  return (
    <PageContainer title="Alış" description="Mal girişi: qaralama yazılır, təsdiqləndikdə anbar qalığı artır.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Qaralama</p>
          <p className={styles.summaryValue}>{isLoading ? '…' : draftPurchases}</p>
        </Card>
        <Card>
          <p className={styles.summaryLabel}>Təsdiqlənib</p>
          <p className={styles.summaryValue}>{isLoading ? '…' : approvedPurchases}</p>
        </Card>
      </div>
      <div className={styles.salesLayout}>
        <PurchaseForm onCreated={(purchase) => setSelectedId(purchase.id)} />
        <InvoiceReceipt
          title="Alış qaiməsi"
          dekont={dekont}
          isLoading={detail.isLoading}
          error={detail.error}
          emptyText="Qaimə üçün əvvəlcə alış yazın."
          onView={() => setPreview(true)}
          onPrint={() => window.print()}
          onPdf={viewPdf}
        />
      </div>
      <div className={styles.periodRow} role="group" aria-label="Alış filtri">
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
      <PurchaseTable
        purchases={shownPurchases}
        emptyText={filter === FILTER_CANCELLED ? 'Ləğv edilmiş alış yoxdur.' : 'Hələ alış yoxdur.'}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        onView={viewPurchase}
        onApprove={handleApprove}
        approvingId={approvingId}
        canDelete={canDelete}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
      {preview ? (
        <DekontPreview
          title="Alış qaiməsi"
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
