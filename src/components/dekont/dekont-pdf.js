export function dekontPdfLines(dekont) {
  const lines = []

  if (dekont.number) {
    lines.push(`Qaime: ${dekont.number}`)
  }

  for (const row of dekont.meta ?? []) {
    lines.push(`${row.label}: ${row.value}`)
  }

  for (const line of dekont.lines ?? []) {
    lines.push(`${line.name}  ${line.qty} x ${line.price}  ${line.total}`)
  }

  for (const row of dekont.totals ?? []) {
    lines.push(`${row.label}: ${row.value}`)
  }

  if (dekont.table) {
    lines.push(dekont.table.columns.join(' | '))
    if (dekont.table.rows.length === 0) {
      lines.push(dekont.table.empty ?? 'Hele melumat yoxdur.')
    } else {
      for (const row of dekont.table.rows) {
        lines.push(row.join(' | '))
      }
    }
  } else if (!dekont.lines?.length) {
    for (const row of dekont.rows ?? []) {
      lines.push(`${row.label}: ${row.value}`)
    }
  }

  if (dekont.footer) {
    lines.push(dekont.footer)
  }

  return lines
}
