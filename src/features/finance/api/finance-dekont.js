import { formatDate, toDateInput } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { openReportPdf } from '@/lib/pdf'

const FOOTER = 'NexusERP maliyyə hesabatı'

function reportMeta() {
  return [{ label: 'Tarix', value: formatDate(toDateInput()) }]
}

export function buildBalanceDekont({ income, expenseTotal, balance, payroll }) {
  return {
    title: 'Balans hesabatı',
    meta: reportMeta(),
    rows: [
      { label: 'Bu günkü mədaxil', value: formatAzn(income) },
      { label: 'Bu günkü məxaric', value: formatAzn(expenseTotal) },
      { label: 'Bu ayın maaş', value: formatAzn(payroll) },
      { label: 'Bu günkü qalıq', value: formatAzn(balance), strong: true },
    ],
    footer: FOOTER,
  }
}

export function buildMizanDekont(months) {
  return {
    title: 'Mizan hesabatı',
    meta: reportMeta(),
    table: {
      columns: ['Ay', 'Mədaxil', 'Məxaric', 'Qalıq'],
      rows: months.map((month) => [
        month.label,
        formatAzn(month.income),
        formatAzn(month.expense),
        formatAzn(month.balance),
      ]),
      empty: 'Hələ mizan hesabatı yoxdur.',
    },
    footer: FOOTER,
  }
}

export function buildStoreMizanDekont(storeMonths) {
  return {
    title: 'Mağaza mizan hesabatı',
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
      empty: 'Hələ mağaza mizan hesabatı yoxdur.',
    },
    footer: FOOTER,
  }
}

export function openFinanceDekontPdf(dekont, filename) {
  return openReportPdf(filename, dekont)
}
