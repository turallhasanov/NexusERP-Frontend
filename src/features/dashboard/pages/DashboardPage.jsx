import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

const SUMMARY_CARDS = [
  { label: 'Açıq sifariş', value: '12' },
  { label: 'Kritik ehtiyat', value: '1' },
  { label: 'Bu günkü mədaxil', value: '18.400 ₼' },
]

export function DashboardPage() {
  useDocumentTitle('İdarə paneli')

  return (
    <PageContainer title="İdarə paneli" description="Günün xülasə rəqəmləri.">
      <div className={styles.summaryGrid}>
        {SUMMARY_CARDS.map((card) => (
          <Card key={card.label}>
            <p className={styles.summaryLabel}>{card.label}</p>
            <p className={styles.summaryValue}>{card.value}</p>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
