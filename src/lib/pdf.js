function toWinAnsi(value) {
  return String(value)
    .replaceAll('ə', 'e')
    .replaceAll('Ə', 'E')
    .replaceAll('ı', 'i')
    .replaceAll('İ', 'I')
    .replaceAll('ö', 'o')
    .replaceAll('Ö', 'O')
    .replaceAll('ü', 'u')
    .replaceAll('Ü', 'U')
    .replaceAll('ş', 's')
    .replaceAll('Ş', 'S')
    .replaceAll('ç', 'c')
    .replaceAll('Ç', 'C')
    .replaceAll('ğ', 'g')
    .replaceAll('Ğ', 'G')
    .replaceAll('₼', 'AZN')
    .replaceAll('№', 'No')
    .replaceAll('—', '-')
    .replaceAll('–', '-')
    .replaceAll('\u00a0', ' ')
    .replaceAll('\u202f', ' ')
    .replaceAll(/[^\x20-\x7E]/g, ' ')
}

function escapePdf(value) {
  return toWinAnsi(value).replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)')
}

function asciiBytes(text) {
  const bytes = new Uint8Array(text.length)

  for (let index = 0; index < text.length; index += 1) {
    bytes[index] = text.charCodeAt(index)
  }

  return bytes
}

function assemblePdf(objects) {
  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`

  return asciiBytes(pdf)
}

function downloadPdf(filename, bytes) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return url
}

function charWidth(char) {
  if (char >= '0' && char <= '9') {
    return 0.556
  }

  if (char === ' ' || char === ',' || char === '.' || char === ':') {
    return 0.278
  }

  if (char === '-') {
    return 0.333
  }

  return 0.55
}

function textWidth(value, size) {
  return [...toWinAnsi(value)].reduce((sum, char) => sum + charWidth(char) * size, 0)
}

function clipText(value, size, maxWidth) {
  let shown = toWinAnsi(value)

  while (shown.length > 1 && textWidth(shown, size) > maxWidth) {
    shown = `${shown.slice(0, -2)}.`
  }

  return shown
}

function fillRect(x, y, width, height, color) {
  return `${color} ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`
}

function strokeRect(x, y, width, height) {
  return `0.35 w 0.75 0.75 0.75 RG ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S`
}

function hLine(x1, x2, y) {
  return `0.35 w 0.82 0.82 0.82 RG ${x1.toFixed(2)} ${y.toFixed(2)} m ${x2.toFixed(2)} ${y.toFixed(2)} l S`
}

function drawText(x, y, value, { size = 10, font = 'F1', color = '0 0 0 rg', align = 'left', maxWidth } = {}) {
  const shown = maxWidth ? clipText(value, size, maxWidth) : toWinAnsi(value)
  const left = align === 'right' ? x - textWidth(shown, size) : x
  return `BT /${font} ${size} Tf ${color} 1 0 0 1 ${left.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdf(shown)}) Tj ET`
}

function columnLayout(count, left, width) {
  if (count === 5) {
    const amount = 88
    const rest = width - amount * 3
    const store = rest * 0.56
    const month = rest - store
    return [
      { x: left, width: store, align: 'left' },
      { x: left + store, width: month, align: 'left' },
      { x: left + store + month, width: amount, align: 'right' },
      { x: left + store + month + amount, width: amount, align: 'right' },
      { x: left + store + month + amount * 2, width: amount, align: 'right' },
    ]
  }

  const amount = 100
  const first = width - amount * 3
  return [
    { x: left, width: first, align: 'left' },
    { x: left + first, width: amount, align: 'right' },
    { x: left + first + amount, width: amount, align: 'right' },
    { x: left + first + amount * 2, width: amount, align: 'right' },
  ]
}

function cellX(column, padding) {
  return column.align === 'right' ? column.x + column.width - padding : column.x + padding
}

function buildPdfBytes(title, lines) {
  const stream = [
    'BT',
    '/F1 18 Tf',
    '72 780 Td',
    `(${escapePdf(title)}) Tj`,
    '/F1 11 Tf',
    '0 -24 Td',
    '(NexusERP) Tj',
    '0 -28 Td',
    ...lines.flatMap((line, index) => (index === 0 ? [`(${escapePdf(line)}) Tj`] : [`0 -18 Td (${escapePdf(line)}) Tj`])),
    'ET',
  ].join('\n')

  return assemblePdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ])
}

function buildReportPdfBytes(dekont) {
  const pageW = 595
  const pageH = 842
  const margin = 40
  const contentW = pageW - margin * 2
  const date = dekont.meta?.find((row) => row.label === 'Tarix')?.value ?? ''
  const ops = []

  ops.push(fillRect(0, 754, pageW, 88, '0.07 0.08 0.1 rg'))
  ops.push(fillRect(0, 754, pageW, 4, '0.2 0.83 0.6 rg'))
  ops.push(drawText(margin, 812, 'NEXUSERP', { size: 9, font: 'F2', color: '0.7 0.72 0.74 rg' }))
  ops.push(drawText(pageW - margin, 812, date, { size: 10, color: '1 1 1 rg', align: 'right' }))
  ops.push(drawText(margin, 778, dekont.title, { size: 22, font: 'F2', color: '1 1 1 rg' }))

  let y = 718

  if (dekont.table) {
    const columns = dekont.table.columns
    const layout = columnLayout(columns.length, margin, contentW)
    const rowH = 26
    const tableBottom = Math.max(64, y - rowH * (1 + Math.max(dekont.table.rows.length, 1)))

    ops.push(fillRect(margin, tableBottom, contentW, y - tableBottom, '1 1 1 rg'))
    ops.push(strokeRect(margin, tableBottom, contentW, y - tableBottom))
    ops.push(fillRect(margin, y - rowH, contentW, rowH, '0.1 0.11 0.13 rg'))

    columns.forEach((column, index) => {
      const cell = layout[index]
      const pad = cell.align === 'right' ? 10 : 12
      ops.push(
        drawText(cellX(cell, pad), y - 18, column, {
          size: 8,
          font: 'F2',
          color: '1 1 1 rg',
          align: cell.align,
          maxWidth: cell.width - 16,
        }),
      )
    })

    y -= rowH
    const rows = dekont.table.rows.length ? dekont.table.rows : [null]

    rows.forEach((cells, rowIndex) => {
      const top = y - rowH
      if (rowIndex % 2 === 1) {
        ops.push(fillRect(margin, top, contentW, rowH, '0.97 0.97 0.97 rg'))
      }

      if (!cells) {
        ops.push(
          drawText(margin + 12, y - 17, dekont.table.empty ?? 'Hele melumat yoxdur.', {
            size: 10,
            color: '0.45 0.45 0.45 rg',
            maxWidth: contentW - 24,
          }),
        )
      } else {
        cells.forEach((value, index) => {
          const cell = layout[index]
          const pad = cell.align === 'right' ? 10 : 12
          ops.push(
            drawText(cellX(cell, pad), y - 17, value, {
              size: 10,
              font: cell.align === 'right' ? 'F2' : 'F1',
              align: cell.align,
              maxWidth: cell.width - 16,
            }),
          )
        })
      }

      y -= rowH
      if (rowIndex < rows.length - 1) {
        ops.push(hLine(margin, margin + contentW, y))
      }
    })
  } else {
    const rows = dekont.rows ?? []
    const boxH = rows.length * 36 + 16
    const boxBottom = y - boxH

    ops.push(fillRect(margin, boxBottom, contentW, boxH, '1 1 1 rg'))
    ops.push(strokeRect(margin, boxBottom, contentW, boxH))

    rows.forEach((row, index) => {
      const top = y - 8 - index * 36
      const textY = top - 22
      if (row.strong) {
        ops.push(fillRect(margin, top - 36, contentW, 36, '0.07 0.08 0.1 rg'))
        ops.push(
          drawText(margin + 16, textY, row.label, {
            size: 11,
            font: 'F2',
            color: '1 1 1 rg',
            maxWidth: contentW * 0.55,
          }),
        )
        ops.push(
          drawText(margin + contentW - 16, textY, row.value, {
            size: 13,
            font: 'F2',
            color: '1 1 1 rg',
            align: 'right',
          }),
        )
      } else {
        ops.push(drawText(margin + 16, textY, row.label, { size: 11, color: '0.35 0.35 0.35 rg', maxWidth: contentW * 0.55 }))
        ops.push(drawText(margin + contentW - 16, textY, row.value, { size: 12, font: 'F2', align: 'right' }))
        if (index < rows.length - 1 && !rows[index + 1]?.strong) {
          ops.push(hLine(margin + 16, margin + contentW - 16, top - 36))
        }
      }
    })

    y = boxBottom
  }

  ops.push(hLine(margin, margin + contentW, 52))
  ops.push(drawText(margin, 36, dekont.footer ?? 'NexusERP', { size: 8, color: '0.5 0.5 0.5 rg' }))
  ops.push(drawText(pageW - margin, 36, '1 / 1', { size: 8, color: '0.5 0.5 0.5 rg', align: 'right' }))

  const stream = ops.join('\n')

  return assemblePdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  ])
}

export function openPdf(filename, title, lines) {
  return downloadPdf(filename, buildPdfBytes(title, lines))
}

export function openReportPdf(filename, dekont) {
  return downloadPdf(filename, buildReportPdfBytes(dekont))
}
