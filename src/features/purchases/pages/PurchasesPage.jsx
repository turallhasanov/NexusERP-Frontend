import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { DekontPreview, DekontPrintRoot } from '@/components/dekont/DekontPreview'
import { buildPurchaseDekont, openPurchaseDekontPdf } from '@/features/purchases/api/purchase-dekont'
import { PurchaseForm } from '@/features/purchases/components/PurchaseForm'
import { PurchaseReceipt } from '@/features/purchases/components/PurchaseReceipt'
import { PurchaseTable } from '@/features/purchases/components/PurchaseTable'
import { usePurchases } from '@/features/purchases/api/use-purchases'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

export function PurchasesPage() {
  const { purchases } = usePurchases()
  const [selectedId, setSelectedId] = useState('')
  const [preview, setPreview] = useState(false)
  const selectedPurchase = purchases.find((purchase) => purchase.id === selectedId) ?? purchases[0]
  const dekont = selectedPurchase ? buildPurchaseDekont(selectedPurchase) : null
  useDocumentTitle('Alış')

  function viewPurchase(purchaseId) {
    setSelectedId(purchaseId)
    setPreview(true)
  }

  function viewPdf() {
    if (!selectedPurchase) {
      return
    }

    openPurchaseDekontPdf(selectedPurchase)
    setPreview(true)
  }

  return (
    <PageContainer title="Alış" description="Toptan mal girişi və depo qalığı.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Alış sayı</p>
          <p className={styles.summaryValue}>{purchases.length}</p>
        </Card>
      </div>
      <div className={styles.salesLayout}>
        <PurchaseForm />
        <PurchaseReceipt
          purchase={selectedPurchase}
          onView={() => selectedPurchase && viewPurchase(selectedPurchase.id)}
          onPrint={() => window.print()}
          onPdf={viewPdf}
        />
      </div>
      <PurchaseTable purchases={purchases} onView={viewPurchase} />
      {preview ? (
        <DekontPreview title="Alış dekontu" dekont={dekont} onClose={() => setPreview(false)} />
      ) : null}
      <DekontPrintRoot dekont={dekont} />
    </PageContainer>
  )
}
