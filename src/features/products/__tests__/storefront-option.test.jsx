import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearCompany, setCompany } from '@/store/company-store'
import { EditProductModal } from '../components/EditProductModal'
import { ProductForm } from '../components/ProductForm'

vi.mock('@/features/products/api/use-product-types', () => ({
  useProductTypes: () => ({ types: [], isLoading: false }),
}))
vi.mock('@/features/products/api/use-product-units', () => ({
  useProductUnits: () => ({ units: [], isLoading: false }),
}))

const product = { id: 'p1', sku: 'MHS-001', name: 'BBB', typeId: '', unitId: '', purchasePrice: 1, unitPrice: 2, showOnWebsite: false }

afterEach(() => clearCompany())

function renderForm() {
  return render(
    <MemoryRouter>
      <ProductForm />
    </MemoryRouter>,
  )
}

describe('storefront option follows the active company', () => {
  it('is hidden when the company has no storefront connection', () => {
    setCompany({ id: 'c1', name: 'Başqa MMC' })
    renderForm()
    expect(screen.queryByText(/Storefront-da göstər/)).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('uses the connected storefront name in the add form', () => {
    setCompany({ id: 'c1', name: 'Khazar MMC', storefrontName: 'Khazar' })
    renderForm()
    expect(screen.getByLabelText('Khazar Storefront-da göstər')).toBeInTheDocument()
  })

  it('uses another storefront name instead of a hardcoded one', () => {
    setCompany({ id: 'c2', name: 'Digər MMC', storefrontName: 'Bakı Market' })
    renderForm()
    expect(screen.getByLabelText('Bakı Market Storefront-da göstər')).toBeInTheDocument()
    expect(screen.queryByText(/Khazar/)).not.toBeInTheDocument()
  })

  it('is hidden in the edit modal without a connection and named with one', () => {
    setCompany({ id: 'c1', name: 'Başqa MMC' })
    const { unmount } = render(<EditProductModal product={product} onClose={() => {}} />)
    expect(screen.queryByText(/Storefront-da göstər/)).not.toBeInTheDocument()
    unmount()

    setCompany({ id: 'c2', name: 'Khazar MMC', storefrontName: 'Khazar' })
    render(<EditProductModal product={product} onClose={() => {}} />)
    expect(screen.getByLabelText('Khazar Storefront-da göstər')).toBeInTheDocument()
  })
})
