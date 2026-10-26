import { formatAzn } from '@/lib/money'
import { formatMargin } from '@/features/finance/api/finance-summary'
import { formatDate, formatPeriod, periodColumn, periodFileTag, periodLabel, toDateInput } from '@/lib/date'
import { openReportPdf } from '@/lib/pdf'

const FOOTER = 'NexusERP maliyyə hesabatı'

function reportMeta(period) {
  return [
    { label: 'Dövr', value: periodLabel(period) },
    { label: 'Tarix', value: formatDate(toDateInput()) },
  ]
}

// `totals` of GET /api/finance/summary without a store: the same figures as the cards and "Bütün mağazalar".
export function buildBalanceDekont({ totals, labels, period }) {
  const t = totals ?? {}

  return {
    title: 'Balans hesabatı',
    meta: reportMeta(period),
    rows: [
      { label: labels.income, value: formatAzn(t.revenue ?? 0) },
      { label: 'Satılan malın maya dəyəri', value: formatAzn(t.costOfGoodsSold ?? 0) },
      { label: 'Əməliyyat xərcləri', value: formatAzn(t.operatingExpenses ?? 0) },
      { label: labels.payroll, value: formatAzn(t.payroll ?? 0) },
      { label: labels.expense, value: formatAzn(t.totalExpenses ?? 0) },
      { label: labels.balance, value: formatAzn(t.netProfit ?? 0), strong: true },
      { label: 'Marja', value: formatMargin(t.profitMargin) },
    ],
    footer: FOOTER,
  }
}

// Rows of GET /api/finance/mizan.
export function buildMizanDekont(rows, period) {
  const column = periodColumn(period)

  return {
    title: 'Mizan hesabatı',
    meta: reportMeta(period),
    table: {
      columns: [column, 'Mədaxil', 'Maya dəyəri', 'Xərclər', 'Maaş', 'Qalıq', 'Marja'],
      rows: rows.map((row) => [
        formatPeriod(row.key, period),
        formatAzn(row.totals.revenue),
        formatAzn(row.totals.costOfGoodsSold),
        formatAzn(row.totals.operatingExpenses),
        formatAzn(row.totals.payroll),
        formatAzn(row.totals.netProfit),
        formatMargin(row.totals.profitMargin),
      ]),
      empty: 'Hələ mizan hesabatı yoxdur.',
    },
    footer: FOOTER,
  }
}

// Rows of GET /api/finance/summary (`stores`); `storeName` is the selected store, or null for all stores.
export function buildStoreMizanDekont(rows, period, storeName = null) {
  return {
    title: 'Mağaza mizan hesabatı',
    meta: [...reportMeta(period), { label: 'Mağaza', value: storeName ?? 'Bütün mağazalar' }],
    table: {
      columns: ['Mağaza', 'Mədaxil', 'Maya dəyəri', 'Xərclər', 'Maaş', 'Xalis nəticə', 'Marja'],
      rows: rows.map((row) => [
        row.name,
        formatAzn(row.totals.revenue),
        formatAzn(row.totals.costOfGoodsSold),
        formatAzn(row.totals.operatingExpenses),
        formatAzn(row.totals.payroll),
        formatAzn(row.totals.netProfit),
        formatMargin(row.totals.profitMargin),
      ]),
      empty: 'Hələ mağaza mizan hesabatı yoxdur.',
    },
    footer: FOOTER,
  }
}

export function buildIncomeDekont(entries, period) {
  return {
    title: 'Mədaxil hesabatı',
    meta: reportMeta(period),
    table: {
      columns: ['Qaimə', 'Kontragent', 'VÖEN', 'Məhsul', 'Növ', 'Məbləğ'],
      rows: entries.map((entry) => [
        entry.number,
        entry.customer,
        entry.voen,
        entry.product,
        entry.type === 'retail' ? 'Pərakəndə' : 'Toptan',
        formatAzn(entry.total),
      ]),
      empty: 'Hələ mədaxil yoxdur.',
    },
    footer: FOOTER,
  }
}

export function buildExpenseDekont(expenses, period) {
  return {
    title: 'Məxaric hesabatı',
    meta: reportMeta(period),
    table: {
      columns: ['Qaimə', 'Kateqoriya', 'Növ', 'Məbləğ'],
      rows: expenses.map((expense) => [expense.number, expense.category, 'Məxaric', formatAzn(expense.amount)]),
      empty: 'Hələ məxaric yoxdur.',
    },
    footer: FOOTER,
  }
}

export function financePdfName(kind, period) {
  const names = {
    balance: 'balans-hesabati',
    mizan: 'mizan-hesabati',
    store: 'magaza-mizan-hesabati',
    income: 'medaxil-hesabati',
    expense: 'mexaric-hesabati',
  }

  return `${names[kind]}-${periodFileTag(period)}.pdf`
}

export function openFinanceDekontPdf(dekont, filename) {
  return openReportPdf(filename, dekont)
}
