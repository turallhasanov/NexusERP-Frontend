import { beforeEach, describe, expect, it, vi } from 'vitest'

const customers = {
  'c-1': { id: 'c-1', code: 'KNT-001', name: 'Tural Hasanov', phone: '+994501234567' },
  'c-2': { id: 'c-2', code: 'KNT-002', name: 'Əli Əliyev', phone: '+994559998877' },
}

vi.mock('@/store/customers-store', () => ({ getCustomer: (id) => customers[id] }))

const { matchesCustomerSearch } = await import('../order-search')

const wholesale = { number: 'STŞ-013', customerId: 'c-1', customer: 'Tural Hasanov', retailCustomer: null }
const other = { number: 'STŞ-014', customerId: 'c-2', customer: 'Əli Əliyev', retailCustomer: null }
const online = {
  number: 'STŞ-015',
  customerId: 'khazar',
  customer: 'Leyla Həsənova',
  retailCustomer: { name: 'Leyla Həsənova', phone: '+994701112233' },
}

describe('matchesCustomerSearch', () => {
  beforeEach(() => vi.clearAllMocks())

  it('keeps everything for blank text', () => {
    expect([wholesale, other, online].every((order) => matchesCustomerSearch(order, '  '))).toBe(true)
  })

  it('finds a customer by name, case-insensitively', () => {
    expect([wholesale, other, online].filter((order) => matchesCustomerSearch(order, 'tural'))).toEqual([wholesale])
  })

  it('finds a counterparty by code and an invoice by number', () => {
    expect(matchesCustomerSearch(other, 'knt-002')).toBe(true)
    expect(matchesCustomerSearch(wholesale, 'knt-002')).toBe(false)
    expect(matchesCustomerSearch(wholesale, 'STŞ-013')).toBe(true)
  })

  it.each(['+994501234567', '050 123 45 67', '(50) 123-45-67', '501234567'])('finds a phone written as %s', (text) => {
    expect(matchesCustomerSearch(wholesale, text)).toBe(true)
    expect(matchesCustomerSearch(other, text)).toBe(false)
  })

  it('finds an online shopper by name and phone', () => {
    expect(matchesCustomerSearch(online, 'Leyla')).toBe(true)
    expect(matchesCustomerSearch(online, '070 111 22 33')).toBe(true)
    expect(matchesCustomerSearch(wholesale, '070 111 22 33')).toBe(false)
  })

  it('does not match a one- or two-digit number against phones', () => {
    expect(matchesCustomerSearch(other, '7')).toBe(false)
  })
})
