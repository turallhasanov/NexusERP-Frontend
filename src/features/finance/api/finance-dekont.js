import { dekontPdfLines } from '@/components/dekont/dekont-pdf'
import { formatDate, toDateInput } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { openPdf } from '@/lib/pdf'

const FOOTER = 'NexusERP maliyyə hesabatı'

function reportMeta() {
  return [{ label: 'Tarix', value: formatDate(toDateInput()) }]
}

export function buildBalanceDekont({ income, expenseTotal, balance, payroll }) {
  return {
    title: 'Günün bilançosu',
    meta: reportMeta(),
    rows: [
      { label: 'Bu günkü mədaxil', value: formatAzn(income) },
      { label: 'Bu günkü məxaric', value: formatAzn(expenseTotal) },
      { label: 'Bu günkü qalıq', value: formatAzn(balance) },
      { label: 'Bu ayın maaş', value: formatAzn(payroll) },
    ],
    footer: FOOTER,
  }
}

export function buildMizanDekont(months) {
  return {
    title: 'Aylıq mizan',
    meta: reportMeta(),
    table: {
      columns: ['Ay', 'Mədaxil', 'Məxaric', 'Qalıq'],
      rows: months.map((month) => [
        month.label,
        formatAzn(month.income),
        formatAzn(month.expense),
        formatAzn(month.balance),
      ]),
      empty: 'Hələ aylıq mizan yoxdur.',
    },
    footer: FOOTER,
  }
}

export function buildStoreMizanDekont(storeMonths) {
  return {
    title: 'Mağaza mizanı',
    meta: reportMeta(),
    table: {
      columns: ['Mağaza', 'Ay', 'Mədaxil', 'Məxaric', 'Qalıq'],
      rows: storeMonths.map((row) => [
        row.store,
        row.label,
        formatAzn(row.income),
        formatAzn(row.expense),
        formatAzn(row.balance),
      ]),
      empty: 'Hələ mağaza mizanı yoxdur.',
    },
    footer: FOOTER,
  }
}

export function openFinanceDekontPdf(dekont, filename) {
  return openPdf(filename, dekont.title, dekontPdfLines(dekont))
}
