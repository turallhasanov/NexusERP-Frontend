import { PageContainer } from '@/components/layout/PageContainer'
import { ProductTable } from '@/features/inventory/components/ProductTable'
import { useProducts } from '@/features/inventory/api/use-products'
import { useDocumentTitle } from '@/hooks/use-document-title'

export function InventoryPage() {
  const { products } = useProducts()
  useDocumentTitle('Anbar')

  return (
    <PageContainer title="Anbar" description="Anbardakı məhsulların cari vəziyyəti.">
      <ProductTable products={products} />
    </PageContainer>
  )
}
