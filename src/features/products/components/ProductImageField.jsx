import { useCallback, useState } from 'react'
import { useStorefront } from '@/features/company/api/use-company'
import { addFiles, makeMain, MAX_PHOTOS } from '@/features/products/lib/product-images'
import { cn } from '@/lib/cn'
import { productImageSrc } from '@/lib/product-image'
import { styles } from '@/lib/styles'

// The server accepts these (it reads the file's content, not its name); checking here only saves a round trip.
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 8 * 1024 * 1024

const THEMES = {
  light: {
    label: styles.fieldLabel,
    button: styles.buttonSecondary,
    hint: 'text-neutral-500',
    link: styles.textAction,
    frame: 'border-neutral-200',
    badge: 'bg-neutral-900 text-white',
  },
  // Inside the dark modals (AdminModal).
  admin: {
    label: styles.adminFieldLabel,
    button: styles.adminButtonGhost,
    hint: 'text-slate-400',
    link: 'text-xs text-slate-300 underline hover:text-white',
    frame: 'border-white/10',
    badge: 'bg-emerald-400 text-slate-900',
  },
}

// One thumbnail. A picked file is shown through a temporary blob address that lives exactly as long as the <img> does:
// the ref callback creates it when the image is attached and its cleanup revokes it when the image goes away (the photo
// is removed, the form closes). Creating it in render and revoking it in an effect would break the preview whenever
// React re-runs effects (StrictMode in development): the image would point at an address that was already revoked.
function PhotoThumb({ file, src, alt, frame }) {
  const [failed, setFailed] = useState(false)
  const attach = useCallback(
    (img) => {
      if (!img || !file) {
        return undefined
      }

      const previewUrl = URL.createObjectURL(file)
      img.src = previewUrl

      return () => URL.revokeObjectURL(previewUrl)
    },
    [file],
  )

  if (failed || (!file && !src)) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn('flex h-24 w-full items-center justify-center bg-neutral-100 px-1 text-center text-[10px] text-neutral-500', frame)}
      >
        Şəkil göstərilə bilmir
      </div>
    )
  }

  return (
    <img
      ref={file ? attach : undefined}
      src={file ? undefined : src}
      alt={alt}
      className="h-24 w-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}

// Optional photos of a product: any number up to MAX_PHOTOS, shown as a thumbnail grid. The first is the main photo
// (Əsas şəkil), the others the gallery; each has "Əsas şəkil et" and "Sil". `currentUrl` is the photo the product
// already has (edit form); `removeCurrent` marks it for removal and is also set when a new file takes its place.
export function ProductImageField({
  inputId,
  files,
  onFilesChange,
  onError,
  currentUrl = null,
  removeCurrent = false,
  onRemoveCurrentChange,
  theme = 'light',
}) {
  const look = THEMES[theme]
  const storefront = useStorefront()
  // Changing the key empties the (uncontrolled) file input after each pick, so the same file can be chosen again.
  const [inputKey, setInputKey] = useState(0)
  const hasCurrent = Boolean(currentUrl) && !removeCurrent
  const total = files.length + (hasCurrent ? 1 : 0)

  function handleChange(event) {
    const picked = Array.from(event.target.files ?? [])
    setInputKey((current) => current + 1)

    if (picked.some((file) => !IMAGE_TYPES.includes(file.type))) {
      onError('Yalnız JPEG, PNG və WebP şəkilləri qəbul olunur.')
      return
    }

    if (picked.some((file) => file.size > MAX_IMAGE_BYTES)) {
      onError('Hər şəkil ən çox 8 MB ola bilər.')
      return
    }

    const next = addFiles(files, picked, MAX_PHOTOS - (hasCurrent ? 1 : 0))
    onError(next.length - files.length < picked.length ? `Ən çox ${MAX_PHOTOS} şəkil seçmək olar.` : '')
    onFilesChange(next)
  }

  function removeFile(index) {
    onFilesChange(files.filter((_, position) => position !== index))
    onError('')
  }

  function setMain(index) {
    onFilesChange(makeMain(files, index))
    // The current photo is replaced by the new main one.
    if (hasCurrent) {
      onRemoveCurrentChange?.(true)
    }
  }

  // The main photo is the current one (when kept), else the first new file.
  const tiles = [
    ...(hasCurrent ? [{ key: 'current', current: true, main: true }] : []),
    ...files.map((file, index) => ({
      key: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      index,
      main: !hasCurrent && index === 0,
    })),
  ]

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span className={look.label}>Şəkil (istəyə bağlı)</span>
      <div className="flex flex-wrap items-center gap-3">
        {/* The browser's own file control is hidden; the label below opens it. */}
        <input
          key={inputKey}
          id={inputId}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleChange}
        />
        <label htmlFor={inputId} className={cn(look.button, 'inline-flex cursor-pointer items-center gap-2')}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {total > 0 ? 'Şəkil əlavə et' : 'Şəkil yüklə'}
        </label>
        <span className={look.hint}>{total === 0 ? 'Şəkilsiz də saxlamaq olar' : `${total} / ${MAX_PHOTOS} şəkil`}</span>
      </div>
      <p className={cn('text-xs', look.hint)}>
        JPEG, PNG, WebP · hər biri ən çox 8 MB · ilk şəkil «Əsas şəkil» olur{storefront.enabled ? `, qalanları ${storefront.name} mağazasının qalereyasına göndərilir` : ''}.
      </p>

      {tiles.length > 0 ? (
        <ul className="mt-1 grid grid-cols-3 gap-3 sm:grid-cols-4" aria-label="Şəkillər">
          {tiles.map((tile) => (
            <li key={tile.key} className={cn('relative overflow-hidden rounded-sm border', look.frame)}>
              {tile.current ? (
                <PhotoThumb src={productImageSrc(currentUrl)} alt="Cari şəkil" frame={look.frame} />
              ) : (
                <PhotoThumb file={tile.file} alt={tile.file.name} frame={look.frame} />
              )}
              {tile.main ? (
                <span className={cn('absolute left-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-medium', look.badge)}>
                  Əsas şəkil
                </span>
              ) : null}
              <div className="flex items-center justify-between gap-1 px-1.5 py-1">
                {tile.main ? (
                  <span />
                ) : (
                  <button type="button" className={look.link} onClick={() => setMain(tile.index)}>
                    Əsas şəkil et
                  </button>
                )}
                <button
                  type="button"
                  className={look.link}
                  aria-label={`${tile.current ? 'Cari şəkil' : tile.file.name}: sil`}
                  onClick={() => (tile.current ? onRemoveCurrentChange?.(true) : removeFile(tile.index))}
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
