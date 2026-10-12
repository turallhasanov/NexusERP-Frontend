import { formatDate, fromApiDate } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { PAYMENT_CASH, paymentLabel } from '@/lib/payment'
import { openReportPdf } from '@/lib/pdf'
import { documentLines } from '@/features/sales/api/sales-dekont'

// `receipt` = { sale, payment, tendered, change, cashRegister }: the POS checkout response plus till-side data.
export function buildPosDekont(receipt) {
  if (!receipt) {
    return null
  }

  const { sale, payment, tendered, change, cashRegister } = receipt
  const totals = [{ label: 'Cəm', value: formatAzn(sale.totalAmount), strong: true }]

  if (payment === PAYMENT_CASH && Number.isFinite(tendered) && Number.isFinite(change)) {
    totals.push(
      { label: 'Verilən', value: formatAzn(tendered) },
      { label: 'Qalıq', value: formatAzn(change) },
    )
  }

  return {
    title: 'POS qəbzi',
    number: sale.documentNumber,
    meta: [
      { label: 'Mağaza', value: sale.store.name },
      { label: 'Depo', value: sale.warehouse.name },
      { label: 'Kassa', value: cashRegister ? `${cashRegister.name} (${cashRegister.code})` : '—' },
      { label: 'Ödəniş', value: paymentLabel(payment) },
      { label: 'Tarix', value: formatDate(fromApiDate(sale.documentDate)) },
    ],
    lines: documentLines(sale),
    totals,
    footer: 'Alışınız üçün təşəkkür edirik.',
  }
}

export function openPosDekontPdf(receipt) {
  const dekont = buildPosDekont(receipt)

  if (!dekont) {
    return null
  }

  return openReportPdf(`${receipt.sale.documentNumber}.pdf`, dekont)
}
