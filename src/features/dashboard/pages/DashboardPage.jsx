import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { useDashboardSummary } from '@/features/dashboard/api/use-dashboard-summary'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

export function DashboardPage() {
  const { openOrders, criticalStock, revenue, expenseTotal, headcount, onLeave } =
    useDashboardSummary()
  useDocumentTitle('İdarə paneli')

  const cards = [
    { label: 'Açıq sifariş', value: String(openOrders) },
    { label: 'Kritik ehtiyat', value: String(criticalStock) },
    { label: 'Bu günkü mədaxil', value: formatAzn(revenue) },
    { label: 'Bu günkü məxaric', value: formatAzn(expenseTotal) },
    { label: 'İşçi sayı', value: String(headcount) },
    { label: 'Məzuniyyətdə', value: String(onLeave) },
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
