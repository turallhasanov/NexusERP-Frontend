import { formatAzn } from '@/lib/money'
import { openPdf } from '@/lib/pdf'

export function buildPurchaseDekont(purchase) {
  return {
    title: `Alış dekontu ${purchase.number}`,
    rows: [
      { label: 'Qaimə №', value: purchase.number },
      { label: 'Kontragent', value: purchase.customer },
      { label: 'VÖEN', value: purchase.voen },
      { label: 'Məhsul', value: purchase.product },
      { label: 'Say', value: String(purchase.quantity) },
      { label: 'Qiymət', value: formatAzn(purchase.unitPrice) },
      { label: 'Depo', value: purchase.warehouse },
      { label: 'İşçi', value: purchase.user },
      { label: 'Məbləğ', value: formatAzn(purchase.total) },
    ],
  }
}

export function openPurchaseDekontPdf(purchase) {
  const { title, rows } = buildPurchaseDekont(purchase)
  return openPdf(
    `${purchase.number}.pdf`,
    title,
    rows.map((row) => `${row.label}: ${row.value}`),
  )
}
