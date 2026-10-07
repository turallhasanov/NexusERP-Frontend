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

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ]

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

export function openPdf(filename, title, lines) {
  const blob = new Blob([buildPdfBytes(title, lines)], { type: 'application/pdf' })
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
