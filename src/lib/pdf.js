import boldUrl from '@/assets/fonts/NotoSans-Bold.ttf?url'
import regularUrl from '@/assets/fonts/NotoSans-Regular.ttf?url'

const PAGE_W = 595
const PAGE_H = 842
const MARGIN = 40
const RIGHT_COLUMNS = new Set(['Mədaxil', 'Məxaric', 'Qalıq', 'Məbləğ', 'Qiymət', 'Cəm', 'Say', 'Maaş', 'Dəyər', 'Miqdar'])

let fontBuffers
let pdfLib

async function loadPdfLib() {
  if (!pdfLib) {
    const [lib, fontkitModule] = await Promise.all([import('pdf-lib'), import('@pdf-lib/fontkit')])
    pdfLib = {
      PDFDocument: lib.PDFDocument,
      rgb: lib.rgb,
      fontkit: fontkitModule.default ?? fontkitModule,
    }
  }

  return pdfLib
}

async function getFontBuffers() {
  if (!fontBuffers) {
    const [regular, bold] = await Promise.all([
      fetch(regularUrl).then((response) => response.arrayBuffer()),
      fetch(boldUrl).then((response) => response.arrayBuffer()),
    ])
    fontBuffers = { regular, bold }
  }

  return fontBuffers
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

function clipText(font, value, size, maxWidth) {
  let shown = String(value ?? '')

  while (shown.length > 1 && font.widthOfTextAtSize(shown, size) > maxWidth) {
    shown = `${shown.slice(0, -2)}.`
  }

  return shown
}

function columnLayout(columns, left, width) {
  const rights = columns.map((column) => RIGHT_COLUMNS.has(column))
  const rightCount = rights.filter(Boolean).length
  const amountW = 82
  const leftCount = columns.length - rightCount
  const rest = width - rightCount * amountW
  const leftW = leftCount ? rest / leftCount : rest
  let x = left

  return columns.map((name, index) => {
    const colWidth = rights[index] ? amountW : leftW
    const column = { name, x, width: colWidth, align: rights[index] ? 'right' : 'left' }
    x += colWidth
    return column
  })
}

function cellX(column, padding, font, value, size) {
  if (column.align === 'right') {
    return column.x + column.width - padding - font.widthOfTextAtSize(value, size)
  }

  return column.x + padding
}

async function buildReportPdfBytes(dekont) {
  const { PDFDocument, rgb, fontkit } = await loadPdfLib()
  const ink = rgb(0.07, 0.08, 0.1)
  const muted = rgb(0.35, 0.35, 0.35)
  const line = rgb(0.82, 0.82, 0.82)
  const white = rgb(1, 1, 1)
  const accent = rgb(0.2, 0.83, 0.6)
  const zebra = rgb(0.97, 0.97, 0.97)
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const buffers = await getFontBuffers()
  const regular = await pdfDoc.embedFont(buffers.regular, { subset: true })
  const bold = await pdfDoc.embedFont(buffers.bold, { subset: true })
  const contentW = PAGE_W - MARGIN * 2
  const date = dekont.meta?.find((row) => row.label === 'Tarix')?.value ?? ''
  let page = pdfDoc.addPage([PAGE_W, PAGE_H])
  let y = 718

  function addPage() {
    page = pdfDoc.addPage([PAGE_W, PAGE_H])
    y = 780
  }

  function ensure(space) {
    if (y < space) {
      addPage()
    }
  }

  function drawText(x, baseline, value, { size = 10, font = regular, color = ink, maxWidth } = {}) {
    const shown = maxWidth ? clipText(font, value, size, maxWidth) : String(value ?? '')
    page.drawText(shown, { x, y: baseline, size, font, color })
  }

  page.drawRectangle({ x: 0, y: 754, width: PAGE_W, height: 88, color: ink })
  page.drawRectangle({ x: 0, y: 754, width: PAGE_W, height: 4, color: accent })
  page.drawText('NEXUSERP', { x: MARGIN, y: 812, size: 9, font: bold, color: rgb(0.7, 0.72, 0.74) })
  if (date) {
    const shown = clipText(regular, date, 10, 160)
    page.drawText(shown, {
      x: PAGE_W - MARGIN - regular.widthOfTextAtSize(shown, 10),
      y: 812,
      size: 10,
      font: regular,
      color: white,
    })
  }
  page.drawText(clipText(bold, dekont.title, 20, contentW), {
    x: MARGIN,
    y: 778,
    size: 20,
    font: bold,
    color: white,
  })

  if (dekont.number) {
    drawText(MARGIN, y, dekont.number, { size: 10, font: bold, color: muted, maxWidth: contentW })
    y -= 22
  }

  for (const row of dekont.meta ?? []) {
    ensure(80)
    drawText(MARGIN, y, `${row.label}: ${row.value}`, { size: 10, color: muted, maxWidth: contentW })
    y -= 16
  }

  if (dekont.meta?.length) {
    y -= 8
  }

  const table =
    dekont.table ??
    (dekont.lines?.length
      ? {
          columns: ['Məhsul', 'Say', 'Qiymət', 'Cəm'],
          rows: dekont.lines.map((item) => [item.name, item.qty, item.price, item.total]),
        }
      : null)

  if (table) {
    const layout = columnLayout(table.columns, MARGIN, contentW)
    const rowH = 24
    const rows = table.rows.length ? table.rows : [null]

    ensure(80)
    page.drawRectangle({ x: MARGIN, y: y - rowH, width: contentW, height: rowH, color: ink })
    table.columns.forEach((column, index) => {
      const cell = layout[index]
      const shown = clipText(bold, column, 8, cell.width - 14)
      drawText(cellX(cell, 8, bold, shown, 8), y - 16, shown, { size: 8, font: bold, color: white })
    })
    y -= rowH

    rows.forEach((cells, rowIndex) => {
      ensure(70)
      if (rowIndex % 2 === 1) {
        page.drawRectangle({ x: MARGIN, y: y - rowH, width: contentW, height: rowH, color: zebra })
      }

      if (!cells) {
        drawText(MARGIN + 10, y - 16, table.empty ?? 'Hələ məlumat yoxdur.', {
          size: 10,
          color: muted,
          maxWidth: contentW - 20,
        })
      } else {
        cells.forEach((value, index) => {
          const cell = layout[index]
          const font = cell.align === 'right' ? bold : regular
          const shown = clipText(font, value, 9, cell.width - 14)
          drawText(cellX(cell, 8, font, shown, 9), y - 16, shown, { size: 9, font })
        })
      }

      y -= rowH
      page.drawLine({
        start: { x: MARGIN, y },
        end: { x: MARGIN + contentW, y },
        thickness: 0.4,
        color: line,
      })
    })

    y -= 12
  } else if (dekont.rows?.length) {
    const boxH = dekont.rows.length * 34 + 12
    ensure(boxH + 60)
    const boxBottom = y - boxH
    page.drawRectangle({
      x: MARGIN,
      y: boxBottom,
      width: contentW,
      height: boxH,
      borderColor: rgb(0.75, 0.75, 0.75),
      borderWidth: 0.6,
    })

    dekont.rows.forEach((row, index) => {
      const top = y - 6 - index * 34
      if (row.strong) {
        page.drawRectangle({ x: MARGIN, y: top - 34, width: contentW, height: 34, color: ink })
        drawText(MARGIN + 14, top - 22, row.label, { size: 11, font: bold, color: white, maxWidth: contentW * 0.55 })
        const shown = clipText(bold, row.value, 12, 180)
        drawText(MARGIN + contentW - 14 - bold.widthOfTextAtSize(shown, 12), top - 22, shown, {
          size: 12,
          font: bold,
          color: white,
        })
      } else {
        drawText(MARGIN + 14, top - 22, row.label, { size: 11, color: muted, maxWidth: contentW * 0.55 })
        const shown = clipText(bold, row.value, 11, 180)
        drawText(MARGIN + contentW - 14 - bold.widthOfTextAtSize(shown, 11), top - 22, shown, { size: 11, font: bold })
      }
    })

    y = boxBottom - 12
  }

  for (const row of dekont.totals ?? []) {
    ensure(70)
    const font = row.strong ? bold : regular
    const size = row.strong ? 12 : 10
    drawText(MARGIN, y, row.label, { size, font, color: row.strong ? ink : muted, maxWidth: contentW * 0.55 })
    const shown = clipText(font, row.value, size, 180)
    drawText(PAGE_W - MARGIN - font.widthOfTextAtSize(shown, size), y, shown, { size, font })
    y -= 18
  }

  page.drawLine({
    start: { x: MARGIN, y: 52 },
    end: { x: PAGE_W - MARGIN, y: 52 },
    thickness: 0.4,
    color: line,
  })
  drawText(MARGIN, 36, dekont.footer ?? 'NexusERP', { size: 8, color: muted, maxWidth: contentW * 0.7 })
  const pageLabel = `${pdfDoc.getPageCount()} / ${pdfDoc.getPageCount()}`
  drawText(PAGE_W - MARGIN - regular.widthOfTextAtSize(pageLabel, 8), 36, pageLabel, { size: 8, color: muted })

  return pdfDoc.save()
}

export async function openReportPdf(filename, dekont) {
  const bytes = await buildReportPdfBytes(dekont)
  return downloadPdf(filename, bytes)
}

export async function openPdf(filename, title, lines) {
  return openReportPdf(filename, {
    title,
    rows: lines.map((line) => {
      const index = line.indexOf(': ')
      if (index === -1) {
        return { label: line, value: '' }
      }

      return { label: line.slice(0, index), value: line.slice(index + 2) }
    }),
  })
}
