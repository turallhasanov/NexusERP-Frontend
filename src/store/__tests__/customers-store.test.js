import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/api-client', () => ({ apiClient: { get: vi.fn() } }))
vi.mock('@/store/auth-store', () => ({
  getAuthState: () => ({ activeCompanyId: 'company-1' }),
  subscribeAuth: vi.fn(),
}))

const SERVER_ROWS = [
  { id: 'c-1', code: 'KNT-001', name: 'Bakı Tekstil', voen: '1234567891', isActive: true, isSystem: false },
  { id: 'c-2', code: 'KNT-002', name: 'Gəncə Parça', voen: null, isActive: true, isSystem: false },
  { id: 'c-3', code: 'KNT-003', name: 'Sumqayıt Ticarət', voen: null, isActive: true, isSystem: false },
]

// The store keeps its cache at module level: each test gets a fresh copy of the module.
let store

beforeEach(async () => {
  vi.resetModules()
  const { apiClient } = await import('@/services/api-client')
  apiClient.get.mockResolvedValue({ items: SERVER_ROWS })
  store = await import('@/store/customers-store')
  await store.loadCustomers()
})

describe('customers-store after DELETE /api/customers/{id}', () => {
  it('keeps a deactivated counterparty in the cache with isActive: false (the updater callback path)', () => {
    store.markCustomerDeleted('c-2', true)

    expect(store.getCustomer('c-2')).toEqual({ ...SERVER_ROWS[1], voen: '', isActive: false })
    expect(store.getCustomer('c-1').isActive).toBe(true)
  })

  it('hides the deactivated counterparty from the lists people pick from', async () => {
    const { result } = renderHook(() => store.useCustomersStore())
    await waitFor(() => expect(result.current.customers).toHaveLength(3))

    act(() => store.markCustomerDeleted('c-2', true))

    expect(result.current.customers.map((c) => c.id)).toEqual(['c-1', 'c-3'])
  })

  it('removes a counterparty the server deleted outright', () => {
    store.markCustomerDeleted('c-3', false)

    expect(store.getCustomer('c-3')).toBeNull()
    expect(store.getCustomer('c-1')).not.toBeNull()
  })

  it('maps a missing VÖEN to an empty string', () => {
    expect(store.getCustomer('c-2').voen).toBe('')
    expect(store.getCustomer('c-1').voen).toBe('1234567891')
  })

  it('adds a created counterparty at the end', () => {
    store.addCustomer({ id: 'c-4', code: 'KNT-004', name: 'Yeni', voen: null, isActive: true, isSystem: false })

    expect(store.getCustomer('c-4')).toMatchObject({ name: 'Yeni', voen: '' })
  })
})
