import { payrollForPeriod, payrollRows } from '@/features/hr/api/payroll'
import { formatDate, periodFileTag, periodLabel, toDateInput } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { openReportPdf } from '@/lib/pdf'

export function buildPayrollDekont(employees, period) {
  const rows = payrollRows(employees, period)
  const total = payrollForPeriod(employees, period)

  return {
    title: 'Maaş hesabatı',
    meta: [
      { label: 'Dövr', value: periodLabel(period) },
      { label: 'Tarix', value: formatDate(toDateInput()) },
    ],
    table: {
      columns: ['Ad', 'Vəzifə', 'Şöbə', 'Maaş'],
      rows: rows.map((employee) => [
        employee.name,
        employee.title,
        employee.department,
        formatAzn(employee.amount),
      ]),
      empty: 'Bu dövrdə maaş yoxdur.',
    },
    totals: [{ label: 'Cəm', value: formatAzn(total), strong: true }],
    footer: 'NexusERP maaş hesabatı',
  }
}

export function openPayrollDekontPdf(employees, period) {
  const dekont = buildPayrollDekont(employees, period)
  return openReportPdf(`maas-hesabati-${periodFileTag(period)}.pdf`, dekont)
}
