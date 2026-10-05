import { PageContainer } from '@/components/layout/PageContainer'
import { useDocumentTitle } from '@/hooks/use-document-title'

export function HrPage() {
  useDocumentTitle('İnsan resursları')

  return (
    <PageContainer
      title="İnsan resursları"
      description="İşçi və məzuniyyət ekranları bu modulə əlavə olunacaq."
    />
  )
}
