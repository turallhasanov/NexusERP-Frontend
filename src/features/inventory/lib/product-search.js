// Folds case and the Azerbaijani letters so "palto" finds "Palto" and "sarf" finds "Şərf".
const FOLD = { ı: 'i', İ: 'i', ə: 'e', Ə: 'e', ö: 'o', Ö: 'o', ü: 'u', Ü: 'u', ş: 's', Ş: 's', ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g' }

export function fold(value) {
  return String(value ?? '')
    .replace(/[ıİəƏöÖüÜşŞçÇğĞ]/g, (letter) => FOLD[letter])
    .toLowerCase()
    .trim()
}

// A barcode scanner types the whole code, so an exact barcode or product code is the user's choice.
export function findExactProduct(products, query) {
  const needle = fold(query)

  if (!needle) {
    return null
  }

  return products.find((product) => fold(product.barcode) === needle || fold(product.sku) === needle) ?? null
}

// Name, product code (MHS-002) or barcode contains the text. Exact code/barcode first, then prefixes, then the rest.
export function searchProducts(products, query) {
  const needle = fold(query)

  if (!needle) {
    return products
  }

  const ranked = []

  for (const product of products) {
    // typeName is only on POS items; it stays a searchable field there.
    const fields = [fold(product.name), fold(product.sku), fold(product.barcode), fold(product.typeName)]

    if (!fields.some((field) => field.includes(needle))) {
      continue
    }

    let rank = 2

    if (fields[1] === needle || fields[2] === needle) {
      rank = 0
    } else if (fields.some((field) => field.startsWith(needle))) {
      rank = 1
    }

    ranked.push({ product, rank })
  }

  return ranked.sort((a, b) => a.rank - b.rank).map((entry) => entry.product)
}
