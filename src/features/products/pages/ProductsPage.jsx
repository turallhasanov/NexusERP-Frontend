import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { ProductTable } from '@/features/inventory/components/ProductTable'
import { ProductForm } from '@/features/products/components/ProductForm'
import { ProductTypeForm } from '@/features/products/components/ProductTypeForm'
import { ProductUnitForm } from '@/features/products/components/ProductUnitForm'
import { useProductTypes } from '@/features/products/api/use-product-types'
import { useProductUnits } from '@/features/products/api/use-product-units'
import { useProducts } from '@/features/inventory/api/use-products'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

export function ProductsPage() {
  const { products } = useProducts()
  const { types } = useProductTypes()
  const { units } = useProductUnits()
  useDocumentTitle('Məhsul')

  return (
    <PageContainer title="Məhsul" description="Tip, ölçü vahidi, barkod və satış qiyməti.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Məhsul sayı</p>
          <p className={styles.summaryValue}>{products.length}</p>
        </Card>
        <Card>
          <p className={styles.summaryLabel}>Tip sayı</p>
          <p className={styles.summaryValue}>{types.length}</p>
        </Card>
        <Card>
          <p className={styles.summaryLabel}>Vahid sayı</p>
          <p className={styles.summaryValue}>{units.length}</p>
        </Card>
      </div>
      <h2 className={styles.sectionTitle}>Məhsul tipi</h2>
      <ProductTypeForm />
      <h2 className={styles.sectionTitle}>Ölçü vahidi</h2>
      <ProductUnitForm />
      <h2 className={styles.sectionTitle}>Kataloq</h2>
      <ProductForm />
      <ProductTable products={products} />
    </PageContainer>
  )
}
