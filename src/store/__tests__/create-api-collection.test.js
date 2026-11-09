import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/api-client', () => ({ apiClient: { get: vi.fn() } }))
vi.mock('@/store/auth-store', () => ({
  getAuthState: () => ({ activeCompanyId: 'company-1' }),
  subscribeAuth: vi.fn(),
}))

const { apiClient } = await import('@/services/api-client')
const { createApiCollection } = await import('@/store/create-api-collection')

const ROWS = [
  { id: 'c-1', code: 'KNT-001', name: 'Bakı Tekstil', isActive: true },
  { id: 'c-2', code: 'KNT-002', name: 'Gəncə Parça', isActive: true },
]

async function loadedCollection() {
  apiClient.get.mockResolvedValue({ items: ROWS })
  const collection = createApiCollection({ path: '/customers' })
  await collection.load()
  return collection
}

describe('createApiCollection.update', () => {
  beforeEach(() => {
    apiClient.get.mockReset()
  })

  it('passes the current row to the updater and stores what it returns', async () => {
    const collection = await loadedCollection()
    const updater = vi.fn((customer) => ({ ...customer, isActive: false }))

    collection.update('c-2', updater)

    expect(updater).toHaveBeenCalledOnce()
    expect(updater).toHaveBeenCalledWith(ROWS[1])
    expect(collection.find('c-2')).toEqual({ ...ROWS[1], isActive: false })
  })

  it('leaves the other rows untouched (same objects) and does not mutate the old state', async () => {
    const collection = await loadedCollection()
    const before = collection.getState()

    collection.update('c-2', (customer) => ({ ...customer, isActive: false }))

    const after = collection.getState()
    expect(after).not.toBe(before)
    expect(after.items[0]).toBe(before.items[0])
    expect(before.items[1].isActive).toBe(true)
  })

  it('re-renders components reading the collection', async () => {
    const collection = await loadedCollection()
    const { result } = renderHook(() => collection.useCollection())
    expect(result.current.items.find((c) => c.id === 'c-1').isActive).toBe(true)

    act(() => collection.update('c-1', (customer) => ({ ...customer, isActive: false })))

    expect(result.current.items.find((c) => c.id === 'c-1').isActive).toBe(false)
  })

  it('changes nothing for an id that is not cached', async () => {
    const collection = await loadedCollection()
    const updater = vi.fn()

    collection.update('missing', updater)

    expect(updater).not.toHaveBeenCalled()
    expect(collection.getState().items).toEqual(ROWS)
  })
})

describe('createApiCollection.load', () => {
  it('maps every row through fromApi and keeps a failed load as an error message', async () => {
    apiClient.get.mockResolvedValueOnce({ items: [{ id: 'c-1', voen: null }] })
    const collection = createApiCollection({ path: '/customers', fromApi: (row) => ({ ...row, voen: row.voen ?? '' }) })

    await collection.load()
    expect(collection.getState()).toEqual({ items: [{ id: 'c-1', voen: '' }], status: 'ready', error: '' })

    apiClient.get.mockRejectedValueOnce(new Error('Serverə qoşulmaq mümkün olmadı.'))
    await collection.load()
    expect(collection.getState()).toMatchObject({ status: 'error', error: 'Serverə qoşulmaq mümkün olmadı.' })
  })

  it('is started by the first component that reads the collection', async () => {
    apiClient.get.mockResolvedValue({ items: ROWS })
    const collection = createApiCollection({ path: '/customers' })

    const { result } = renderHook(() => collection.useCollection())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.items).toHaveLength(2))
    expect(apiClient.get).toHaveBeenCalledWith('/customers')
  })
})
