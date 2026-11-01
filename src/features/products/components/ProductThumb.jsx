import { useState } from 'react'
import { productImageSrc } from '@/lib/product-image'

// 40x40 product photo for tables; a neutral placeholder when the product has none or the photo cannot be loaded.
export function ProductThumb({ imageUrl, name }) {
  const src = productImageSrc(imageUrl)
  // The address that failed to load, so a different photo (after an edit) is tried again.
  const [failedSrc, setFailedSrc] = useState('')

  if (src && failedSrc !== src) {
    return (
      <img
        src={src}
        alt={name}
        width={40}
        height={40}
        loading="lazy"
        className="h-10 w-10 rounded-sm border border-neutral-200 object-cover"
        onError={() => setFailedSrc(src)}
      />
    )
  }

  return (
    <span
      className="flex h-10 w-10 items-center justify-center rounded-sm border border-neutral-200 bg-neutral-100 text-neutral-400"
      title="Şəkil yoxdur"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m4 18 5-5 4 4 3-3 4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
