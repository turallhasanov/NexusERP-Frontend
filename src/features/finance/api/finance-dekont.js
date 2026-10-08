import { formatAzn } from '@/lib/money'
import { formatDate, periodColumn, periodFileTag, periodLabel, toDateInput } from '@/lib/date'
import { openReportPdf } from '@/lib/pdf'

const FOOTER = 'NexusERP maliyyə hesabatı'

function reportMeta(period) {
  return [
    { label: 'Dövr', value: periodLabel(period) },
    { label: 'Tarix', value: formatDate(toDateInput()) },
  ]
}

export function buildBalanceDekont({ income, expenseTotal, balance, payroll, labels, period }) {
  return {
    title: 'Balans hesabatı',
    meta: reportMeta(period),
    rows: [
      { label: labels.income, value: formatAzn(income) },
      { label: labels.expense, value: formatAzn(expenseTotal) },
      { label: labels.payroll, value: formatAzn(payroll) },
      { label: labels.balance, value: formatAzn(balance), strong: true },
    ],
    footer: FOOTER,
  }
}

export function buildMizanDekont(months, period) {
  const column = periodColumn(period)

  return {
    title: 'Mizan hesabatı',
    meta: reportMeta(period),
    table: {
      columns: [column, 'Mədaxil', 'Məxaric', 'Qalıq'],
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

export function buildStoreMizanDekont(storeMonths, period) {
  const column = periodColumn(period)

  return {
    title: 'Mağaza mizan hesabatı',
    meta: reportMeta(period),
    table: {
      columns: ['Mağaza', column, 'Mədaxil', 'Məxaric', 'Qalıq'],
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
