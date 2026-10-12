import { formatDate, fromApiDate } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { openReportPdf } from '@/lib/pdf'
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
export function buildSalesDekont(sale) {
  return {
    title: 'Satış dekontu',
    number: sale.documentNumber,
    meta: [
      { label: 'Növ', value: sale.customerId ? 'Toptan' : 'Pərakəndə' },
      { label: 'Kontragent', value: sale.customer?.name ?? 'Pərakəndə' },
      { label: 'VÖEN', value: (sale.customerId && getCustomer(sale.customerId)?.voen) || '—' },
      { label: 'Mağaza', value: sale.store.name },
      { label: 'Depo', value: sale.warehouse.name },
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
