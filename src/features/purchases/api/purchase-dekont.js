import { formatDate, fromApiDate } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { openReportPdf } from '@/lib/pdf'
import { DOCUMENT_STATUS_LABELS, documentLines } from '@/features/sales/api/sales-dekont'
import { getCustomer } from '@/store/customers-store'

// Full purchase from GET /api/purchases/{id} (or a create / approve response).
export function buildPurchaseDekont(purchase) {
  return {
    title: 'Alış dekontu',
    number: purchase.documentNumber,
    meta: [
      { label: 'Kontragent', value: purchase.customer.name },
      { label: 'VÖEN', value: getCustomer(purchase.customerId)?.voen || '—' },
      { label: 'Depo', value: purchase.warehouse.name },
      { label: 'Status', value: DOCUMENT_STATUS_LABELS[purchase.status] ?? purchase.status },
      { label: 'Tarix', value: formatDate(fromApiDate(purchase.documentDate)) },
    ],
    lines: documentLines(purchase),
    totals: [{ label: 'Cəm', value: formatAzn(purchase.totalAmount), strong: true }],
    footer: 'NexusERP alış dekontu',
  }
}

export function openPurchaseDekontPdf(purchase) {
  return openReportPdf(`${purchase.documentNumber}.pdf`, buildPurchaseDekont(purchase))
}
