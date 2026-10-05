import { PageContainer } from '@/components/layout/PageContainer'
import { useDocumentTitle } from '@/hooks/use-document-title'

export function FinancePage() {
  useDocumentTitle('Maliyyə')

  return (
    <PageContainer
      title="Maliyyə"
      description="Kassa, bank və kontragent qalıqları bu modulə əlavə olunacaq."
    />
  )
}
