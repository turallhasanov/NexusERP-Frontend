import { PageContainer } from '@/components/layout/PageContainer.tsx'
import { useDocumentTitle } from '@/hooks/use-document-title.ts'

export function FinancePage() {
  useDocumentTitle('Maliyyə')

  return (
    <PageContainer
      title="Maliyyə"
      description="Kassa, bank və kontragent qalıqları bu modulə əlavə olunacaq."
    />
  )
}
