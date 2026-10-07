import { formatAzn } from '@/lib/money'
import { PAYMENT_CASH, paymentLabel } from '@/lib/payment'
import { downloadPdf } from '@/lib/pdf'
import { printHtmlDocument } from '@/lib/print-document'

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

export function buildSalesDekont(order) {
  const rows = [
    { label: 'Qaimə №', value: order.number },
    { label: 'Növ', value: order.type === 'retail' ? 'Pərakəndə' : 'Toptan' },
    { label: 'Kontragent', value: order.customer },
    { label: 'VÖEN', value: order.voen },
    { label: 'Məhsul', value: order.product },
    { label: 'Say', value: String(order.quantity) },
    { label: 'Depo', value: order.warehouse },
    { label: 'Mağaza', value: order.store },
    { label: 'Ödəniş', value: paymentLabel(order.payment) },
    { label: 'Məbləğ', value: formatAzn(order.total) },
  ]

  if (order.payment === PAYMENT_CASH && Number.isFinite(order.tendered) && Number.isFinite(order.change)) {
    rows.push(
      { label: 'Verilən', value: formatAzn(order.tendered) },
      { label: 'Qalıq', value: formatAzn(order.change) },
    )
  }

  return {
    title: `Satış dekontu ${order.number}`,
    rows,
  }
}

export function printSalesDekont(order) {
  const { title, rows } = buildSalesDekont(order)
  const body = rows
    .map(
      (row) =>
        `<div class="row"><dt>${escapeHtml(row.label)}</dt><dd>${escapeHtml(row.value)}</dd></div>`,
    )
    .join('')

  printHtmlDocument(`<!DOCTYPE html>
<html lang="az">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #111; margin: 48px; }
      p { margin: 0 0 8px; letter-spacing: 0.2em; font-size: 12px; color: #666; }
      h1 { margin: 0 0 24px; font-size: 22px; }
      .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e5e5; }
      dt { color: #555; }
      dd { margin: 0; font-weight: 600; }
    </style>
  </head>
  <body>
    <p>NEXUSERP</p>
    <h1>${escapeHtml(title)}</h1>
    <dl>${body}</dl>
  </body>
</html>`)
}

export function downloadSalesDekontPdf(order) {
  const { title, rows } = buildSalesDekont(order)
  downloadPdf(
    `${order.number}.pdf`,
    title,
    rows.map((row) => `${row.label}: ${row.value}`),
  )
}
