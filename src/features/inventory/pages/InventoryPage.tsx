import { PageContainer } from '@/components/layout/PageContainer.tsx'
import { ProductTable } from '@/features/inventory/components/ProductTable.tsx'
import { useProducts } from '@/features/inventory/api/use-products.ts'
import { useDocumentTitle } from '@/hooks/use-document-title.ts'

export function InventoryPage() {
  const { products } = useProducts()
  useDocumentTitle('Anbar')

  return (
    <PageContainer title="Anbar" description="Anbardakı məhsulların cari vəziyyəti.">
      <ProductTable products={products} />
    </PageContainer>
  )
}
