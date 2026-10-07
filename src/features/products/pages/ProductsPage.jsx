import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { ProductTable } from '@/features/inventory/components/ProductTable'
import { ProductForm } from '@/features/products/components/ProductForm'
import { useProducts } from '@/features/inventory/api/use-products'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

export function ProductsPage() {
  const { products } = useProducts()
  useDocumentTitle('Məhsul')

  return (
    <PageContainer title="Məhsul" description="Kataloq kartı, anbar kodu və barkod.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Məhsul sayı</p>
          <p className={styles.summaryValue}>{products.length}</p>
        </Card>
      </div>
      <ProductForm />
      <ProductTable products={products} />
    </PageContainer>
  )
}
