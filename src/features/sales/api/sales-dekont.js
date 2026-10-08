import { formatDate } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { PAYMENT_CASH, paymentLabel } from '@/lib/payment'
import { openReportPdf } from '@/lib/pdf'

function cashTotals(order, total) {
  const totals = [{ label: 'Cəm', value: formatAzn(total), strong: true }]

  if (order.payment === PAYMENT_CASH && Number.isFinite(order.tendered) && Number.isFinite(order.change)) {
    totals.push(
      { label: 'Verilən', value: formatAzn(order.tendered) },
      { label: 'Qalıq', value: formatAzn(order.change) },
    )
  }

  return totals
}

export function buildSalesDekont(order) {
  return {
    title: 'Satış dekontu',
    number: order.number,
    meta: [
      { label: 'Növ', value: order.type === 'retail' ? 'Pərakəndə' : 'Toptan' },
      { label: 'Kontragent', value: order.customer },
      { label: 'VÖEN', value: order.voen },
      { label: 'Depo', value: order.warehouse },
      { label: 'Mağaza', value: order.store },
      { label: 'Ödəniş', value: paymentLabel(order.payment) },
      { label: 'Tarix', value: formatDate(order.createdAt) },
    ],
    lines: [
      {
        name: order.product,
        qty: String(order.quantity),
        price: formatAzn(order.unitPrice),
        total: formatAzn(order.total),
      },
    ],
    totals: cashTotals(order, order.total),
    footer: 'Alışınız üçün təşəkkür edirik.',
  }
}

export function openSalesDekontPdf(order) {
  const dekont = buildSalesDekont(order)
  return openReportPdf(`${order.number}.pdf`, dekont)
}
