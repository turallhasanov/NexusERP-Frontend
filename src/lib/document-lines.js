let nextLineKey = 1

// One editable row of a purchase / sale form. `key` only identifies the row in React.
export function emptyLine() {
  const line = { key: nextLineKey, productId: '', quantity: '1', unitPrice: '' }
  nextLineKey += 1
  return line
}

function toNumber(value) {
  return value === '' || value === null || value === undefined ? null : Number(value)
}

// Form rows → API `items`. Blank numbers go as null so the server answers with its "Sətir N: ..." message.
// Rows with no product and nothing typed are skipped, so a trailing blank row does not block saving.
export function toItemsPayload(lines) {
  return lines
    .filter((line) => line.productId || line.unitPrice !== '' || (line.quantity !== '' && line.quantity !== '1'))
    .map((line) => ({
      productId: line.productId,
      quantity: toNumber(line.quantity),
      unitPrice: toNumber(line.unitPrice),
    }))
}

export function linesTotal(lines) {
  return lines.reduce((sum, line) => {
    const quantity = Number(line.quantity)
    const unitPrice = Number(line.unitPrice)

    return Number.isFinite(quantity) && Number.isFinite(unitPrice) ? sum + quantity * unitPrice : sum
  }, 0)
}
