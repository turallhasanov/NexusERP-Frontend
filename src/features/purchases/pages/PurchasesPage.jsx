import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { DekontPreview, DekontPrintRoot } from '@/components/dekont/DekontPreview'
import { approvePurchase } from '@/features/purchases/api/approve-purchase'
import { fetchPurchase } from '@/features/purchases/api/fetch-purchase'
import { buildPurchaseDekont, openPurchaseDekontPdf } from '@/features/purchases/api/purchase-dekont'
import { PurchaseForm } from '@/features/purchases/components/PurchaseForm'
import { PurchaseTable } from '@/features/purchases/components/PurchaseTable'
import { usePurchases } from '@/features/purchases/api/use-purchases'
import { InvoiceReceipt } from '@/features/sales/components/InvoiceReceipt'
import { useDocumentDetail } from '@/hooks/use-document-detail'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'
import { showToast } from '@/store/toast-store'

export function PurchasesPage() {
  const { purchases, draftPurchases, approvedPurchases, isLoading, error, reload } = usePurchases()
  const [selectedId, setSelectedId] = useState('')
  const [preview, setPreview] = useState(false)
  const [approvingId, setApprovingId] = useState('')
  const selectedPurchase = purchases.find((purchase) => purchase.id === selectedId) ?? purchases[0]
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
      <PurchaseTable
        purchases={purchases}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        onView={viewPurchase}
        onApprove={handleApprove}
        approvingId={approvingId}
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
