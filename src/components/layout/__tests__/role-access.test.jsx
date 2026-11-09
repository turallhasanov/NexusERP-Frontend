import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const auth = { user: { id: 'u1', role: 'staff' } }
vi.mock('@/store/auth-store', () => ({ useAuthStore: () => auth }))
vi.mock('@/features/company/api/use-company', () => ({ useCompany: () => ({ company: { name: 'Test MMC' } }) }))
vi.mock('@/components/brand/BrandLockup', () => ({ BrandLockup: () => null }))

const { Sidebar } = await import('../Sidebar')
const { RequireModuleAccess } = await import('../RequireModuleAccess')
const { RequireCompanyManager } = await import('../RequireCompanyManager')

const labels = () => screen.getAllByRole('link').map((link) => link.textContent)

function renderRoutes(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<RequireModuleAccess />}>
          <Route path="/" element={<p>İdarə paneli səhifəsi</p>} />
          <Route path="/warehouses" element={<p>Anbar səhifəsi</p>} />
          <Route path="/products" element={<p>Məhsul səhifəsi</p>} />
          <Route path="/finance" element={<p>Maliyyə səhifəsi</p>} />
          <Route element={<RequireCompanyManager />}>
            <Route path="/users" element={<p>İstifadəçilər səhifəsi</p>} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  auth.user = { id: 'u1', role: 'staff' }
})

describe('sidebar by role', () => {
  it('shows an İşçi only the warehouse module', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>)
    expect(labels()).toEqual(['Anbar İdarəetməsi'])
  })

  it('shows admins and IT admins every page as before', () => {
    auth.user = { id: 'a', role: 'admin' }
    const { unmount } = render(<MemoryRouter><Sidebar /></MemoryRouter>)
    expect(labels()).toEqual(expect.arrayContaining(['İdarə paneli', 'Anbar İdarəetməsi', 'Maliyyə', 'İnsan resursları', 'Hesabatlar', 'Kontragent']))
    unmount()

    auth.user = { id: 'i', role: 'itadmin' }
    render(<MemoryRouter><Sidebar /></MemoryRouter>)
    expect(labels()).toEqual(expect.arrayContaining(['Maliyyə', 'İstifadəçilər', 'Sistem Logları / Audit']))
  })
})

describe('staff with a custom role', () => {
  it('shows the modules the role ticks, in the sidebar order', () => {
    auth.user = { id: 'u1', role: 'staff', permissions: ['products', 'warehouses'] }
    render(<MemoryRouter><Sidebar /></MemoryRouter>)
    expect(labels()).toEqual(['Anbar İdarəetməsi', 'Məhsul'])
  })

  it('opens exactly those pages and 403s the rest', () => {
    auth.user = { id: 'u1', role: 'staff', permissions: ['products', 'warehouses'] }
    const { unmount } = renderRoutes('/products')
    expect(screen.getByText('Məhsul səhifəsi')).toBeInTheDocument()
    unmount()
    renderRoutes('/finance')
    expect(screen.getByText('İcazəniz yoxdur')).toBeInTheDocument()
  })

  it('lands on the first permitted page when the dashboard is not ticked', () => {
    auth.user = { id: 'u1', role: 'staff', permissions: ['products'] }
    renderRoutes('/')
    expect(screen.getByText('Məhsul səhifəsi')).toBeInTheDocument()
  })

  it('opens the warehouse page for the "Məhsul qalıqları" tick too', () => {
    auth.user = { id: 'u1', role: 'staff', permissions: ['inventory'] }
    renderRoutes('/warehouses')
    expect(screen.getByText('Anbar səhifəsi')).toBeInTheDocument()
  })
})

describe('route guard', () => {
  it('blocks an İşçi from typing /finance and shows the 403 screen', () => {
    renderRoutes('/finance')
    expect(screen.getByText('İcazəniz yoxdur')).toBeInTheDocument()
    expect(screen.queryByText('Maliyyə səhifəsi')).not.toBeInTheDocument()
  })

  it('blocks an İşçi from /users', () => {
    renderRoutes('/users')
    expect(screen.getByText('İcazəniz yoxdur')).toBeInTheDocument()
  })

  it('lets an İşçi into the warehouse and sends "/" there', () => {
    renderRoutes('/warehouses')
    expect(screen.getByText('Anbar səhifəsi')).toBeInTheDocument()
  })

  it('sends an İşçi who opens "/" to the warehouse module', () => {
    renderRoutes('/')
    expect(screen.getByText('Anbar səhifəsi')).toBeInTheDocument()
  })

  it('lets an admin open any page', () => {
    auth.user = { id: 'a', role: 'admin' }
    renderRoutes('/finance')
    expect(screen.getByText('Maliyyə səhifəsi')).toBeInTheDocument()
  })
})
