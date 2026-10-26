import { formatDate, fromApiDate } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { openReportPdf } from '@/lib/pdf'
import { displayPhone } from '@/lib/phone'
import { getCustomer } from '@/store/customers-store'

export const DOCUMENT_STATUS_LABELS = {
  draft: 'Qaralama',
  approved: 'Təsdiqlənib',
}

// Lines of a full API document (sale or purchase) → dekont lines.
export function documentLines(document) {
  return document.items.map((item) => ({
    name: item.product.name,
    qty: `${item.quantity} ${item.product.unitShortName}`,
    price: formatAzn(item.unitPrice),
    total: formatAzn(item.totalPrice),
  }))
}

// Full sale from GET /api/sales/{id} (or a create / approve response).
// A Khazar online order shows its shopper (name, phone, address) instead of a VÖEN.
function customerMeta(sale) {
  if (sale.channel === 'online' && sale.retailCustomer) {
    const { name, phone, address } = sale.retailCustomer

    return [
      { label: 'Növ', value: 'Online (Khazar)' },
      { label: 'Sifariş', value: sale.externalOrderNumber ?? '—' },
      { label: 'Müştəri', value: name },
      { label: 'Telefon', value: displayPhone(phone) || '—' },
      { label: 'Ünvan', value: address || '—' },
    ]
  }

  return [
    { label: 'Növ', value: sale.customerId ? 'Toptan' : 'Pərakəndə' },
    { label: 'Kontragent', value: sale.customer?.name ?? 'Pərakəndə' },
    { label: 'VÖEN', value: (sale.customerId && getCustomer(sale.customerId)?.voen) || '—' },
  ]
}

export function buildSalesDekont(sale) {
  return {
    title: 'Satış qaiməsi',
    number: sale.documentNumber,
    meta: [
      ...customerMeta(sale),
      { label: 'Mağaza', value: sale.store.name },
      { label: 'Anbar', value: sale.warehouse.name },
      { label: 'Status', value: DOCUMENT_STATUS_LABELS[sale.status] ?? sale.status },
      { label: 'Tarix', value: formatDate(fromApiDate(sale.documentDate)) },
    ],
    lines: documentLines(sale),
    totals: [{ label: 'Cəm', value: formatAzn(sale.totalAmount), strong: true }],
    footer: 'Alışınız üçün təşəkkür edirik.',
  }
}

export function openSalesDekontPdf(sale) {
  return openReportPdf(`${sale.documentNumber}.pdf`, buildSalesDekont(sale))
}
