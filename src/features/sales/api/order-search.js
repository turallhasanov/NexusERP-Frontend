import { toLocalDigits } from '@/lib/phone'
import { getCustomer } from '@/store/customers-store'

// Only digits and phone punctuation: the text is a phone number, whatever way it is written.
const PHONE_TEXT = /^[\d\s+\-()]+$/
const MIN_PHONE_DIGITS = 3

// Mirrors GET /api/sales?search=: text over the document number, the customer's name, code and phone (a counterparty,
// or the online shopper). A phone is compared as local digits, so "050 123 45 67" finds "+994501234567".
// Done here too because the sales list is already in memory, so the table narrows as the text is typed.
export function matchesCustomerSearch(order, search) {
  const text = (search ?? '').trim().toLowerCase()

  if (!text) {
    return true
  }

  const customer = order.customerId ? getCustomer(order.customerId) : null
  const phones = [order.retailCustomer?.phone, customer?.phone].filter(Boolean)
  const words = [order.number, order.customer, order.retailCustomer?.name, customer?.name, customer?.code]
    .filter(Boolean)
    .map((word) => String(word).toLowerCase())

  if (words.some((word) => word.includes(text))) {
    return true
  }

  if (!PHONE_TEXT.test(text)) {
    return false
  }

  const wanted = toLocalDigits(text)

  return wanted.length >= MIN_PHONE_DIGITS && phones.some((phone) => toLocalDigits(phone).includes(wanted))
}
