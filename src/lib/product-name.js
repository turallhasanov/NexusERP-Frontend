// Sizes offered in the product forms. A product may also carry any other size text it was given.
export const SIZE_OPTIONS = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']

// "Name (Color / Size)": the form a product's name takes when it has a color and/or a size, the same one the Khazar
// catalog import builds from Khazar's variants. Without either, the name is left as it is.
export function formatProductName(name, color, size) {
  const base = (name ?? '').trim()
  const parts = [color, size].map((part) => (part ?? '').trim()).filter(Boolean)

  return parts.length > 0 ? `${base} (${parts.join(' / ')})` : base
}

// "Base (A / B)" → color A, size B. "Base (X)" has one part: a known size is a size, anything else a color.
// The inverse of formatProductName, so editing a product does not stack a second suffix onto its name.
const SUFFIX = /^(.*\S) \(([^()/]+?)(?: \/ ([^()/]+?))?\)$/

export function parseProductName(fullName) {
  const text = (fullName ?? '').trim()
  const match = SUFFIX.exec(text)

  if (!match) {
    return { name: text, color: '', size: '' }
  }

  const [, base, first, second] = match

  if (second !== undefined) {
    return { name: base, color: first.trim(), size: second.trim() }
  }

  const single = first.trim()
  return SIZE_OPTIONS.includes(single.toUpperCase())
    ? { name: base, color: '', size: single.toUpperCase() }
    : { name: base, color: single, size: '' }
}
