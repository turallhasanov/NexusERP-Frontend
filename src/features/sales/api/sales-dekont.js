import { formatAzn } from '@/lib/money'
import { PAYMENT_CASH, paymentLabel } from '@/lib/payment'
import { openPdf } from '@/lib/pdf'

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

export function openSalesDekontPdf(order) {
  const { title, rows } = buildSalesDekont(order)
  return openPdf(
    `${order.number}.pdf`,
    title,
    rows.map((row) => `${row.label}: ${row.value}`),
  )
}
