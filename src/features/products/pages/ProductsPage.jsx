import { useEffect, useMemo, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { ProductTable } from '@/features/inventory/components/ProductTable'
import { DeleteProductModal } from '@/features/products/components/DeleteProductModal'
import { ProductForm } from '@/features/products/components/ProductForm'
import { ProductTypeForm } from '@/features/products/components/ProductTypeForm'
import { ProductTypeTable } from '@/features/products/components/ProductTypeTable'
import { ProductUnitForm } from '@/features/products/components/ProductUnitForm'
import { deleteProduct } from '@/features/products/api/delete-product'
import { searchProducts } from '@/features/products/api/search-products'
import { useProductTypes } from '@/features/products/api/use-product-types'
import { useProductUnits } from '@/features/products/api/use-product-units'
import { useProducts } from '@/features/inventory/api/use-products'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'
import { toProduct } from '@/store/inventory-store'
import { showToast } from '@/store/toast-store'
import { isCompanyManager } from '@/types/auth'

const SEARCH_DELAY_MS = 300

export function ProductsPage() {
  const { products, isLoading: productsLoading } = useProducts()
  const { types, isLoading: typesLoading, error: typesError, reload: reloadTypes } = useProductTypes()
  const { units, isLoading: unitsLoading } = useProductUnits()
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState({ items: [], isLoading: true, error: '' })
  // Deleting is for company admins and IT admins (the API returns 403 to staff).
  const { user } = useAuthStore()
  const canDelete = isCompanyManager(user)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  useDocumentTitle('Məhsul')

  useEffect(() => {
    let cancelled = false

    // Typing is debounced; a filter change or refresh searches right away.
    const timer = setTimeout(() => {
      setSearch((current) => ({ ...current, isLoading: true, error: '' }))

      searchProducts({ q: query, categoryId })
        .then((items) => {
          if (!cancelled) {
            setSearch({ items, isLoading: false, error: '' })
          }
        })
        .catch((error) => {
          if (!cancelled) {
            setSearch({ items: [], isLoading: false, error: error.message })
          }
        })
    }, query ? SEARCH_DELAY_MS : 0)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, categoryId, refreshKey])

  // Search returns catalog rows; stock comes from the inventory cache when it has the product.
  const rows = useMemo(() => {
    const cached = new Map(products.map((product) => [product.id, product]))
    return search.items.map((product) => cached.get(product.id) ?? toProduct(product))
  }, [products, search.items])

  const isFiltered = query.trim() !== '' || categoryId !== ''

  async function confirmDelete() {
    const product = pendingDelete
    setDeletingId(product.id)

    const result = await deleteProduct(product.id)

    setDeletingId(null)
    setPendingDelete(null)

    if (!result.ok) {
      showToast(result.error, 'error')
      return
    }

    // Removed or deactivated, it leaves the catalog either way; the inventory cache dropped it already.
    setSearch((current) => ({ ...current, items: current.items.filter((item) => item.id !== product.id) }))
    showToast(result.deactivated ? result.message : 'Məhsul uğurla silindi.')
  }

  return (
    <PageContainer title="Məhsul" description="Kateqoriya, ölçü vahidi, barkod, alış və satış qiyməti.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Məhsul sayı</p>
          <p className={styles.summaryValue}>{productsLoading ? '…' : products.length}</p>
        </Card>
        <Card>
          <p className={styles.summaryLabel}>Kateqoriya sayı</p>
          <p className={styles.summaryValue}>{typesLoading ? '…' : types.length}</p>
        </Card>
        <Card>
          <p className={styles.summaryLabel}>Vahid sayı</p>
          <p className={styles.summaryValue}>{unitsLoading ? '…' : units.length}</p>
        </Card>
      </div>
      <h2 className={styles.sectionTitle}>Kateqoriya</h2>
      <ProductTypeForm />
      <ProductTypeTable types={types} isLoading={typesLoading} error={typesError} onRetry={reloadTypes} />
      <h2 className={styles.sectionTitle}>Ölçü vahidi</h2>
      <ProductUnitForm />
      <h2 className={styles.sectionTitle}>Yeni məhsul</h2>
      <ProductForm onCreated={() => setRefreshKey((current) => current + 1)} />
      <h2 className={styles.sectionTitle}>Kataloq</h2>
      <div className={styles.toolbar}>
        <div className={styles.toolbarSearch}>
          <Field label="Axtarış">
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ad, kod və ya barkod"
            />
          </Field>
        </div>
        <Field label="Kateqoriya">
          <select className={styles.input} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">Bütün kateqoriyalar</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </Field>
        <p className={styles.summaryLabel}>{search.isLoading ? <Spinner /> : `${rows.length} məhsul`}</p>
      </div>
      <ProductTable
        products={rows}
        isLoading={search.isLoading && search.items.length === 0}
        error={search.error}
        onRetry={() => setRefreshKey((current) => current + 1)}
        emptyText={isFiltered ? 'Axtarışa uyğun məhsul tapılmadı.' : 'Hələ məhsul yoxdur.'}
        onDelete={canDelete ? setPendingDelete : undefined}
        deletingId={deletingId}
      />
      {pendingDelete ? (
        <DeleteProductModal
          product={pendingDelete}
          deleting={deletingId === pendingDelete.id}
          onConfirm={confirmDelete}
          onClose={() => {
            if (!deletingId) {
              setPendingDelete(null)
            }
          }}
        />
      ) : null}
    </PageContainer>
  )
}
