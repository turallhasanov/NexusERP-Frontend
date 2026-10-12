import { formatDate, toDateInput } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { openReportPdf } from '@/lib/pdf'
import { profitTone } from '@/lib/profit'
import { presetRange, RANGE_PRESETS } from '@/lib/report-range'

export function rangeLabel(rangeId) {
  const preset = RANGE_PRESETS.find((item) => item.id === rangeId)
  const { from, to } = presetRange(rangeId)

  if (!from) {
    return preset?.label ?? ''
  }

  return from === to
    ? `${preset.label} (${formatDate(from)})`
    : `${preset.label} (${formatDate(from)} – ${formatDate(to)})`
}

// Financial KPIs (API) for the selected range. Values are null until the first response arrives.
export function buildKpiCards(summary) {
  const money = (amount) => (summary ? formatAzn(amount) : null)

  return [
    { label: 'Ümumi gəlir', value: money(summary?.totalSales), hint: 'Təsdiqlənmiş satışlar' },
    { label: 'Maya dəyəri', value: money(summary?.cogs), hint: 'Satılan malların maya dəyəri' },
    { label: 'Əməliyyat xərcləri', value: money(summary?.totalExpenses) },
    {
      label: 'Xalis mənfəət',
      value: money(summary?.netProfit),
      tone: summary ? profitTone(summary.netProfit) : 'default',
      hint: summary ? `Yalın mənfəət: ${formatAzn(summary.grossProfit)}` : undefined,
    },
    {
      label: 'Kritik ehtiyat',
      value: summary ? String(summary.lowStockProductsCount) : null,
      tone: summary?.lowStockProductsCount > 0 ? 'warning' : 'default',
      hint: summary ? `Qalığı ${summary.lowStockThreshold} və ya az olan məhsullar` : undefined,
    },
    { label: 'Alış (təsdiqlənmiş)', value: money(summary?.totalPurchases) },
    { label: 'Məhsul sayı', value: summary ? String(summary.totalProducts) : null },
  ]
}

export function buildOperationsCards(operations) {
  return [
    { label: 'Qaralama satış', value: String(operations.draftSales) },
    { label: 'Qaralama alış', value: String(operations.draftPurchases) },
    { label: 'Kontragent sayı', value: String(operations.customerCount) },
    { label: 'Mağaza sayı', value: String(operations.storeCount) },
    { label: 'İşçi sayı', value: String(operations.headcount) },
    { label: 'Məzuniyyətdə', value: String(operations.onLeave) },
    { label: 'Bu ayın maaş', value: formatAzn(operations.payroll) },
  ]
}

export function buildDashboardDekont(cards, rangeId) {
  return {
    title: 'Xülasə hesabatı',
    meta: [
      { label: 'Dövr', value: rangeLabel(rangeId) },
      { label: 'Tarix', value: formatDate(toDateInput()) },
    ],
    table: {
      columns: ['Göstərici', 'Dəyər'],
      rows: cards.filter((card) => card.value !== null).map((card) => [card.label, card.value]),
      empty: 'Hələ xülasə yoxdur.',
    },
    footer: 'NexusERP idarə paneli',
  }
}

export function openDashboardDekontPdf(cards, rangeId) {
  return openReportPdf(`xulase-hesabati-${rangeId}.pdf`, buildDashboardDekont(cards, rangeId))
}
