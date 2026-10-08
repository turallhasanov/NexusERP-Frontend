import { formatAzn } from '@/lib/money'
import { openReportPdf } from '@/lib/pdf'

export function buildPurchaseDekont(purchase) {
  return {
    title: 'Alış dekontu',
    number: purchase.number,
    meta: [{ label: 'Qaimə', value: purchase.number }],
    rows: [
      { label: 'Kontragent', value: purchase.customer },
      { label: 'VÖEN', value: purchase.voen },
      { label: 'Məhsul', value: purchase.product },
      { label: 'Say', value: String(purchase.quantity) },
      { label: 'Qiymət', value: formatAzn(purchase.unitPrice) },
      { label: 'Depo', value: purchase.warehouse },
      { label: 'İşçi', value: purchase.user },
      { label: 'Məbləğ', value: formatAzn(purchase.total), strong: true },
    ],
    footer: 'NexusERP alış dekontu',
  }
}

export function openPurchaseDekontPdf(purchase) {
  return openReportPdf(`${purchase.number}.pdf`, buildPurchaseDekont(purchase))
}
