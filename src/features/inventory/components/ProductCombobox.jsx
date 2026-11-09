import { useId, useState } from 'react'
import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'
import { findExactProduct, searchProducts } from '@/features/inventory/lib/product-search'

const MAX_VISIBLE = 50

// Searchable product picker. Typing filters by name, product code or barcode; a barcode scanner (types the code, then
// Enter) selects the exact match, and `onSelected` lets the form move focus on to the quantity field.
// With `label` null the picker is label-less (a table cell): `ariaLabel` names the input and `inputClassName` styles it.
export function ProductCombobox({
  products,
  value,
  onChange,
  onSelected,
  formatLabel,
  label = 'Məhsul',
  ariaLabel,
  inputClassName,
  placeholder = 'Ad, kod və ya barkod yazın / oxudun',
}) {
  const listId = useId()
  const [query, setQuery] = useState(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const selected = products.find((product) => product.id === value)
  const selectedLabel = selected ? formatLabel(selected) : ''
  const text = query ?? selectedLabel
  const matches = query === null || query === '' ? products : searchProducts(products, query)
  const visible = matches.slice(0, MAX_VISIBLE)
  const active = Math.min(activeIndex, Math.max(visible.length - 1, 0))

  function choose(product) {
    onChange(product.id)
    setQuery(null)
    setOpen(false)
    onSelected?.(product)
  }

  function handleChange(event) {
    setQuery(event.target.value)
    setActiveIndex(0)
    setOpen(true)

    if (value) {
      onChange('')
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(Math.min(active + 1, visible.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(Math.max(active - 1, 0))
    } else if (event.key === 'Escape') {
      setOpen(false)
    } else if (event.key === 'Enter') {
      // Never submit the form from the picker; Enter chooses a product instead.
      event.preventDefault()

      if (query === null) {
        return
      }

      const exact = findExactProduct(products, query)
      const choice = exact ?? (open ? visible[active] : null)

      if (choice) {
        choose(choice)
      }
    }
  }

  return (
    <div className={label ? styles.field : undefined}>
      {label ? (
        <label htmlFor={`${listId}-input`} className={styles.fieldLabel}>
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={`${listId}-input`}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={label ? undefined : ariaLabel}
          aria-activedescendant={open && visible[active] ? `${listId}-${visible[active].id}` : undefined}
          autoComplete="off"
          placeholder={placeholder}
          className={cn(inputClassName ?? styles.input, 'w-full')}
          value={text}
          onChange={handleChange}
          onFocus={(event) => {
            setOpen(true)
            event.target.select()
          }}
          onBlur={() => {
            setOpen(false)
            setQuery(null)
          }}
          onKeyDown={handleKeyDown}
        />
        {open ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-64 w-full min-w-72 overflow-auto rounded-sm border border-neutral-200 bg-white py-1 text-sm shadow-lg glass:rounded-xl glass:border-white/10 glass:bg-slate-800"
          >
            {visible.length === 0 ? (
              <li className="px-3 py-2 text-neutral-500" role="presentation">
                Məhsul tapılmadı
              </li>
            ) : (
              visible.map((product, index) => (
                <li
                  key={product.id}
                  id={`${listId}-${product.id}`}
                  role="option"
                  aria-selected={index === active}
                  // mouseDown (not click) so the input's blur does not close the list before the choice lands.
                  onMouseDown={(event) => {
                    event.preventDefault()
                    choose(product)
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'cursor-pointer px-3 py-2',
                    index === active ? 'bg-neutral-100 glass:bg-white/10' : '',
                  )}
                >
                  <span className="block">{formatLabel(product)}</span>
                  <span className="block text-xs text-neutral-500">
                    {[product.sku, product.barcode].filter(Boolean).join(' · ')}
                  </span>
                </li>
              ))
            )}
            {matches.length > visible.length ? (
              <li className="px-3 py-2 text-xs text-neutral-500" role="presentation">
                Daha {matches.length - visible.length} nəticə var — axtarışı dəqiqləşdirin
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
