import { useEffect, useMemo, useState } from 'react'
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
    name: 'text-neutral-600',
    link: styles.textAction,
    frame: 'border-neutral-200',
  },
  // Inside the dark modals (AdminModal).
  admin: {
    label: styles.adminFieldLabel,
    button: styles.adminButtonGhost,
    name: 'text-slate-300',
    link: 'text-sm text-slate-300 underline hover:text-white',
    frame: 'border-white/10',
  },
}

// Photo picker: the browser's own file control is hidden and a button opens it. Shows the chosen file's name and a
// preview. `currentUrl` is the photo the product already has (edit form); `removeCurrent` marks it for removal.
export function ProductImageField({
  inputId,
  file,
  onFileChange,
  onError,
  currentUrl = null,
  removeCurrent = false,
  onRemoveCurrentChange,
  theme = 'light',
}) {
  const look = THEMES[theme]
  // Changing the key empties the (uncontrolled) file input, e.g. after a save or when the choice is dropped.
  const [inputKey, setInputKey] = useState(0)
  const [lastFile, setLastFile] = useState(file)

  // The parent emptied the field (a form reset): remount the input so the browser forgets the file as well.
  if (lastFile !== file) {
    setLastFile(file)
    if (!file) {
      setInputKey((current) => current + 1)
    }
  }

  // The chosen photo is shown before saving; its object URL is released when it changes or the form goes away.
  const chosenPreview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])
  useEffect(() => () => {
    if (chosenPreview) {
      URL.revokeObjectURL(chosenPreview)
    }
  }, [chosenPreview])

  const hasCurrent = Boolean(currentUrl) && !removeCurrent
  const preview = chosenPreview || (hasCurrent ? productImageSrc(currentUrl) : '')

  function handleChange(event) {
    const picked = event.target.files?.[0] ?? null

    if (picked && !IMAGE_TYPES.includes(picked.type)) {
      onError('Yalnız JPEG, PNG və WebP şəkilləri qəbul olunur.')
      event.target.value = ''
      return
    }

    if (picked && picked.size > MAX_IMAGE_BYTES) {
      onError('Şəkil ən çox 8 MB ola bilər.')
      event.target.value = ''
      return
    }

    onError('')
    onFileChange(picked)
    // A new photo replaces the current one, so it is no longer "to be removed".
    if (picked) {
      onRemoveCurrentChange?.(false)
    }
  }

  function handleClear() {
    if (file) {
      onFileChange(null)
      setInputKey((current) => current + 1)
    } else {
      onRemoveCurrentChange?.(true)
    }
  }

  let fileName = 'Fayl seçilməyib'
  if (file) {
    fileName = file.name
  } else if (hasCurrent) {
    fileName = 'Cari şəkil'
  } else if (removeCurrent) {
    fileName = 'Şəkil silinəcək'
  }

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span className={look.label}>Şəkil (JPEG, PNG, WebP · ən çox 8 MB)</span>
      <div className="flex flex-wrap items-center gap-3">
        {/* The browser's own file control is hidden; the label below opens it. */}
        <input
          key={inputKey}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleChange}
        />
        <label htmlFor={inputId} className={cn(look.button, 'inline-flex cursor-pointer items-center gap-2')}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {file || hasCurrent ? 'Şəkli dəyiş' : 'Şəkil yüklə'}
        </label>
        <span className={cn('min-w-0 max-w-full truncate', look.name)} title={file?.name}>
          {fileName}
        </span>
        {file || hasCurrent ? (
          <button type="button" className={look.link} onClick={handleClear}>
            Sil
          </button>
        ) : null}
      </div>
      {preview ? (
        <img src={preview} alt="Şəkil" className={cn('mt-1 h-24 w-24 rounded-sm border object-cover', look.frame)} />
      ) : null}
    </div>
  )
}
