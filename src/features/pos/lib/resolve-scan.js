import { findExactProduct, searchProducts } from '@/features/inventory/lib/product-search'

// What the till does with the text in the barcode box (a scanner types the code and sends Enter):
//  - 'exact'  the barcode or product code matches one product, ignoring case and spaces;
//  - 'single' the text is part of a name/code/barcode and only one product fits, so the cashier meant that one;
//  - 'many'   several products fit: the cashier picks from the list;
//  - 'none'   nothing fits.
// The category filter plays no part: the whole catalog is searched.
export function resolveScan(catalog, text) {
  const exact = findExactProduct(catalog, text)

  if (exact) {
    return { kind: 'exact', product: exact, count: 1 }
  }

  const matches = searchProducts(catalog, text)

  if (matches.length === 1) {
    return { kind: 'single', product: matches[0], count: 1 }
  }

  return { kind: matches.length > 1 ? 'many' : 'none', product: null, count: matches.length }
}

// The product grid: a search looks through every category, an empty search shows the chosen category.
export function filterPosProducts(catalog, query, typeId) {
  if (query.trim()) {
    return searchProducts(catalog, query)
  }

  return typeId ? catalog.filter((product) => product.typeId === typeId) : catalog
}
