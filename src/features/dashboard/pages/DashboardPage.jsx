import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { useDashboardSummary } from '@/features/dashboard/api/use-dashboard-summary'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

export function DashboardPage() {
  const {
    wholesaleOpen,
    retailOpen,
    productCount,
    customerCount,
    storeCount,
    purchaseCount,
    criticalStock,
    wholesaleRevenue,
    retailRevenue,
    expenseTotal,
    balance,
    headcount,
    onLeave,
    payroll,
  } = useDashboardSummary()
  useDocumentTitle('İdarə paneli')

  const cards = [
    { label: 'Açıq toptan', value: String(wholesaleOpen) },
    { label: 'Açıq pərakəndə', value: String(retailOpen) },
    { label: 'Kritik ehtiyat', value: String(criticalStock) },
    { label: 'Məhsul sayı', value: String(productCount) },
    { label: 'Kontragent sayı', value: String(customerCount) },
    { label: 'Mağaza sayı', value: String(storeCount) },
    { label: 'Alış sayı', value: String(purchaseCount) },
    { label: 'Toptan mədaxil', value: formatAzn(wholesaleRevenue) },
    { label: 'Pərakəndə mədaxil', value: formatAzn(retailRevenue) },
    { label: 'Bu günkü məxaric', value: formatAzn(expenseTotal) },
    { label: 'Bu günkü qalıq', value: formatAzn(balance) },
    { label: 'İşçi sayı', value: String(headcount) },
    { label: 'Məzuniyyətdə', value: String(onLeave) },
    { label: 'Bu ayın maaş', value: formatAzn(payroll) },
  ]

  return (
    <PageContainer title="İdarə paneli" description="Günün xülasə rəqəmləri.">
      <div className={styles.summaryGrid}>
        {cards.map((card) => (
          <Card key={card.label}>
            <p className={styles.summaryLabel}>{card.label}</p>
            <p className={styles.summaryValue}>{card.value}</p>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
