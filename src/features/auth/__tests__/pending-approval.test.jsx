import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const auth = { user: { id: 'u1', email: 'testuser@nexuserp.az', role: 'staff', isApproved: false }, activeCompanyId: 'c1' }
vi.mock('@/store/auth-store', () => ({ useAuthStore: () => auth, updateUser: vi.fn(), logout: vi.fn() }))
vi.mock('@/features/auth/api/fetch-me', () => ({ fetchMe: vi.fn() }))
vi.mock('@/features/auth/api/sign-out', () => ({ signOut: vi.fn() }))
vi.mock('@/components/layout/GlassBackdrop', () => ({ GlassBackdrop: () => null }))

const { fetchMe } = await import('@/features/auth/api/fetch-me')
const { updateUser } = await import('@/store/auth-store')
const { RequireCompany } = await import('@/components/layout/RequireCompany')

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<RequireCompany />}>
          <Route path="/dashboard" element={<p>Məhsullar və stok</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  auth.user = { id: 'u1', email: 'testuser@nexuserp.az', role: 'staff', isApproved: false }
  vi.mocked(fetchMe).mockReset()
  vi.mocked(updateUser).mockReset()
})

describe('pending approval', () => {
  it('shows only the notice, not the app, to an unapproved user', () => {
    renderApp()

    expect(screen.getByText('Giriş məhdudlaşdırıldı')).toBeInTheDocument()
    expect(screen.getByText(/İT \/ Sistem administratoru ilə əlaqə saxlayın/)).toBeInTheDocument()
    expect(screen.queryByText('Məhsullar və stok')).not.toBeInTheDocument()
  })

  it('opens the app for an approved user, and for sessions stored before approval existed', () => {
    auth.user = { id: 'u1', role: 'staff', isApproved: true }
    const { unmount } = renderApp()
    expect(screen.getByText('Məhsullar və stok')).toBeInTheDocument()
    unmount()

    auth.user = { id: 'u1', role: 'admin' }
    renderApp()
    expect(screen.getByText('Məhsullar və stok')).toBeInTheDocument()
  })

  it('rechecks the account on request and stores the fresh profile', async () => {
    vi.mocked(fetchMe).mockResolvedValue({ id: 'u1', isApproved: true, role: 'staff' })
    renderApp()

    await userEvent.click(screen.getByRole('button', { name: 'Yenidən yoxla' }))

    expect(fetchMe).toHaveBeenCalledTimes(1)
    expect(updateUser).toHaveBeenCalledWith({ id: 'u1', isApproved: true, role: 'staff' })
  })
})
