import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const rows = [
  { id: 'me', name: 'Tural IT', email: 'it@test.az', role: 'itadmin', customRoleName: null, isActive: true, createdAt: '2026-01-02T10:00:00' },
  { id: 'u2', name: 'Orxan İşçi', email: 'orxan@test.az', role: 'staff', customRoleName: 'Satıcı', isActive: true, createdAt: '2026-02-03T10:00:00' },
  { id: 'u3', name: 'Köhnə İşçi', email: 'old@test.az', role: 'staff', customRoleName: null, isActive: false, createdAt: '2026-03-04T10:00:00' },
]

vi.mock('@/features/users/api/users-api', () => ({ fetchUsers: vi.fn(), setUserActive: vi.fn(), approveUser: vi.fn() }))
vi.mock('@/store/auth-store', () => ({ useAuthStore: () => ({ user: { id: 'me' } }) }))
vi.mock('@/hooks/use-document-title', () => ({ useDocumentTitle: () => {} }))

const { fetchUsers, setUserActive, approveUser } = await import('@/features/users/api/users-api')
const { UsersPage } = await import('../pages/UsersPage')

beforeEach(() => {
  vi.mocked(fetchUsers).mockReset().mockResolvedValue(rows)
  vi.mocked(setUserActive).mockReset()
  vi.mocked(approveUser).mockReset()
})

describe('UsersPage', () => {
  it('counts active and inactive users and colors each status', async () => {
    render(<UsersPage />)

    expect(await screen.findByText('Orxan İşçi')).toBeInTheDocument()
    expect(screen.getByText('Cəmi istifadəçi').nextSibling).toHaveTextContent('3')
    expect(screen.getByText('Aktiv', { selector: 'p' }).nextSibling).toHaveTextContent('2')
    expect(screen.getByText('Deaktiv', { selector: 'p' }).nextSibling).toHaveTextContent('1')
    expect(screen.getAllByText('Aktiv', { selector: 'span' })).toHaveLength(2)
    expect(screen.getAllByText('Deaktiv', { selector: 'span' })).toHaveLength(1)
    expect(screen.getByText('İşçi · Satıcı')).toBeInTheDocument()
  })

  it('has no switch on your own row', async () => {
    render(<UsersPage />)
    await screen.findByText('Orxan İşçi')

    expect(screen.queryByRole('button', { name: /Tural IT/ })).not.toBeInTheDocument()
    expect(screen.getByText('Siz')).toBeInTheDocument()
  })

  it('asks first, then deactivates and reloads', async () => {
    const user = userEvent.setup()
    vi.mocked(setUserActive).mockResolvedValue({ ...rows[1], isActive: false })
    render(<UsersPage />)

    await user.click(await screen.findByRole('button', { name: 'Orxan İşçi: deaktiv et' }))
    const dialog = screen.getByRole('dialog')
    expect(setUserActive).not.toHaveBeenCalled()
    expect(dialog).toHaveTextContent('orxan@test.az')

    await user.click(within(dialog).getByRole('button', { name: 'Bəli, deaktiv et' }))

    expect(setUserActive).toHaveBeenCalledWith('u2', false)
    expect(fetchUsers).toHaveBeenCalledTimes(2)
  })

  it('offers reactivation for an inactive user and cancelling changes nothing', async () => {
    const user = userEvent.setup()
    render(<UsersPage />)

    await user.click(await screen.findByRole('button', { name: 'Köhnə İşçi: aktivləşdir' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('yenidən aktivləşdirmək')
    await user.click(screen.getByRole('button', { name: 'Ləğv et' }))

    expect(setUserActive).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows a retry row when the list cannot be loaded', async () => {
    vi.mocked(fetchUsers).mockRejectedValue(new Error('Server xətası'))
    render(<UsersPage />)

    expect(await screen.findByText('Server xətası')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Yenidən cəhd et' })).toBeInTheDocument()
  })

  it('lets an admin approve a waiting user and pick the role', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchUsers).mockResolvedValue([...rows, { id: 'u4', name: 'Yeni Qoşulan', email: 'new@test.az', role: 'staff', customRoleName: null, isActive: true, isApproved: false, createdAt: '2026-05-06T10:00:00' }])
    vi.mocked(approveUser).mockResolvedValue({ id: 'u4', name: 'Yeni Qoşulan', isApproved: true })
    render(<UsersPage />)

    expect(await screen.findByText('Təsdiq gözləyir')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /təsdiqlə və rol ver/ })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Yeni Qoşulan: təsdiqlə və rol ver' }))
    const dialog = screen.getByRole('dialog')
    await user.selectOptions(within(dialog).getByRole('combobox'), 'admin')
    await user.click(within(dialog).getByRole('button', { name: 'Təsdiqlə' }))

    expect(approveUser).toHaveBeenCalledWith('u4', 'admin')
    expect(fetchUsers).toHaveBeenCalledTimes(2)
  })
})
