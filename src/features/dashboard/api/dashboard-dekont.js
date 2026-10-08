import { formatDate, periodCardLabels, periodFileTag, periodLabel, PERIOD_DAY, PERIOD_YEAR, toDateInput } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { openReportPdf } from '@/lib/pdf'

function moneyPrefix(period) {
  if (period === PERIOD_DAY) {
    return 'Bu günkü'
  }

  if (period === PERIOD_YEAR) {
    return 'Bu ilin'
  }

  return 'Bu ayın'
}

export function buildDashboardCards(summary, period) {
  const labels = periodCardLabels(period)
  const prefix = moneyPrefix(period)

  return [
    { label: 'Açıq toptan', value: String(summary.wholesaleOpen) },
    { label: 'Açıq pərakəndə', value: String(summary.retailOpen) },
    { label: 'Kritik ehtiyat', value: String(summary.criticalStock) },
    { label: 'Məhsul sayı', value: String(summary.productCount) },
    { label: 'Kontragent sayı', value: String(summary.customerCount) },
    { label: 'Mağaza sayı', value: String(summary.storeCount) },
    { label: 'Alış sayı', value: String(summary.purchaseCount) },
    { label: `${prefix} toptan mədaxil`, value: formatAzn(summary.wholesaleRevenue) },
    { label: `${prefix} pərakəndə mədaxil`, value: formatAzn(summary.retailRevenue) },
    { label: labels.expense, value: formatAzn(summary.expenseTotal) },
    { label: labels.balance, value: formatAzn(summary.balance) },
    { label: 'İşçi sayı', value: String(summary.headcount) },
    { label: 'Məzuniyyətdə', value: String(summary.onLeave) },
    { label: labels.payroll, value: formatAzn(summary.payroll) },
  ]
}

export function buildDashboardDekont(cards, period) {
  return {
    title: 'Xülasə hesabatı',
    meta: [
      { label: 'Dövr', value: periodLabel(period) },
      { label: 'Tarix', value: formatDate(toDateInput()) },
    ],
    table: {
      columns: ['Göstərici', 'Dəyər'],
      rows: cards.map((card) => [card.label, card.value]),
      empty: 'Hələ xülasə yoxdur.',
    },
    footer: 'NexusERP idarə paneli',
  }
}

export function openDashboardDekontPdf(cards, period) {
  return openReportPdf(`xulase-hesabati-${periodFileTag(period)}.pdf`, buildDashboardDekont(cards, period))
}
