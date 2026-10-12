import { emptyLine, linesTotal } from '@/lib/document-lines'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'
import { formatQuantity } from '@/store/product-units-store'

// Line items of a purchase or sale form. Choosing a product prefills its price via `defaultPrice`;
// `stockWarehouseId` shows the balance in that warehouse next to each product.
export function DocumentLinesEditor({ lines, onChange, products, defaultPrice, stockWarehouseId, pricePlaceholder = '0.00' }) {
  function updateLine(key, field, value) {
    onChange(
      lines.map((line) => {
        if (line.key !== key) {
          return line
        }

        if (field === 'productId') {
          const product = products.find((item) => item.id === value)
          return { ...line, productId: value, unitPrice: product ? String(defaultPrice(product)) : '' }
        }

        return { ...line, [field]: value }
      }),
    )
  }

  function removeLine(key) {
    const remaining = lines.filter((line) => line.key !== key)
    onChange(remaining.length ? remaining : [emptyLine()])
  }

  function stockLabel(product) {
    const quantity = stockWarehouseId ? (product.stocks[stockWarehouseId] ?? 0) : product.quantity
    return formatQuantity(quantity, product.unitId)
  }

  return (
    <div>
      <table className={styles.lineTable}>
        <thead>
          <tr>
            <th className={styles.lineHeadCell}>#</th>
            <th className={styles.lineHeadCell}>Məhsul</th>
            <th className={styles.lineHeadCell}>Miqdar</th>
            <th className={styles.lineHeadCell}>Qiymət (₼)</th>
            <th className={styles.lineHeadCell}>Cəm</th>
            <th className={styles.lineHeadCell} aria-label="Sil" />
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => {
            const quantity = Number(line.quantity)
            const unitPrice = Number(line.unitPrice)
            const lineTotal = line.unitPrice !== '' && Number.isFinite(quantity) && Number.isFinite(unitPrice)
              ? formatAzn(quantity * unitPrice)
              : '—'

            return (
              <tr key={line.key}>
                <td className={`${styles.lineCell} text-neutral-500`}>{index + 1}</td>
                <td className={`${styles.lineCell} min-w-56`}>
                  <select
                    className={styles.lineInput}
                    aria-label={`Sətir ${index + 1}: məhsul`}
                    value={line.productId}
                    onChange={(event) => updateLine(line.key, 'productId', event.target.value)}
                  >
                    <option value="">Məhsulu seçin</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({stockLabel(product)})
                      </option>
                    ))}
                  </select>
                </td>
                <td className={`${styles.lineCell} w-28`}>
                  <input
                    type="number"
                    min={0}
                    step="0.001"
                    className={styles.lineInput}
                    aria-label={`Sətir ${index + 1}: miqdar`}
                    value={line.quantity}
                    onChange={(event) => updateLine(line.key, 'quantity', event.target.value)}
                  />
                </td>
                <td className={`${styles.lineCell} w-32`}>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={styles.lineInput}
                    aria-label={`Sətir ${index + 1}: qiymət`}
                    value={line.unitPrice}
                    onChange={(event) => updateLine(line.key, 'unitPrice', event.target.value)}
                    placeholder={pricePlaceholder}
                  />
                </td>
                <td className={`${styles.lineCell} w-28 tabular-nums`}>{lineTotal}</td>
                <td className={`${styles.lineCell} w-10`}>
                  <button
                    type="button"
                    className={styles.headerAction}
                    aria-label={`Sətir ${index + 1}: sil`}
                    onClick={() => removeLine(line.key)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className={styles.lineFooter}>
        <button type="button" className={styles.buttonSecondary} onClick={() => onChange([...lines, emptyLine()])}>
          + Sətir əlavə et
        </button>
        <p className="text-sm">
          Cəmi: <span className="font-semibold tabular-nums">{formatAzn(linesTotal(lines))}</span>
        </p>
      </div>
    </div>
  )
}
