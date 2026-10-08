import { formatDate } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { PAYMENT_CASH, paymentLabel } from '@/lib/payment'
import { openReportPdf } from '@/lib/pdf'

export function buildPosDekont(orders) {
  if (!orders.length) {
    return null
  }

  const first = orders[0]
  const last = orders[orders.length - 1]
  const total = orders.reduce((sum, order) => sum + order.total, 0)
  const totals = [{ label: 'Cəm', value: formatAzn(total), strong: true }]

  if (last.payment === PAYMENT_CASH && Number.isFinite(last.tendered) && Number.isFinite(last.change)) {
    totals.push(
      { label: 'Verilən', value: formatAzn(last.tendered) },
      { label: 'Qalıq', value: formatAzn(last.change) },
    )
  }

  return {
    title: 'POS qəbzi',
    number: orders.length === 1 ? first.number : `${first.number} – ${last.number}`,
    meta: [
      { label: 'Qaimə', value: orders.map((order) => order.number).join(' · ') },
      { label: 'Mağaza', value: first.store },
      { label: 'Depo', value: first.warehouse },
      { label: 'Ödəniş', value: paymentLabel(first.payment) },
      { label: 'Tarix', value: formatDate(first.createdAt) },
    ],
    lines: orders.map((order) => ({
      name: order.product,
      qty: String(order.quantity),
      price: formatAzn(order.unitPrice),
      total: formatAzn(order.total),
    })),
    totals,
    footer: 'Alışınız üçün təşəkkür edirik.',
  }
}

export function openPosDekontPdf(orders) {
  const dekont = buildPosDekont(orders)

  if (!dekont) {
    return null
  }

  return openReportPdf(`${orders[0].number}.pdf`, dekont)
}
