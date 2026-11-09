import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { productImageSrc } from '@/lib/product-image'
import { ProductImageField } from '../components/ProductImageField'

const file = (name) => new File([new Uint8Array(10)], name, { type: 'image/png', lastModified: 1 })

let created
let revoked

beforeEach(() => {
  created = []
  revoked = new Set()
  let counter = 0
  globalThis.URL.createObjectURL = vi.fn(() => {
    const url = `blob:http://localhost/preview-${(counter += 1)}`
    created.push(url)
    return url
  })
  globalThis.URL.revokeObjectURL = vi.fn((url) => revoked.add(url))
})

afterEach(() => vi.restoreAllMocks())

function Harness({ currentUrl = null }) {
  const [files, setFiles] = useState([])
  const [removeCurrent, setRemoveCurrent] = useState(false)

  return (
    <ProductImageField
      inputId="photos"
      files={files}
      onFilesChange={setFiles}
      onError={() => {}}
      currentUrl={currentUrl}
      removeCurrent={removeCurrent}
      onRemoveCurrentChange={setRemoveCurrent}
    />
  )
}

// The address an <img> shows must still be valid: revoking it leaves a broken-image icon.
const shown = (alt) => screen.getByAltText(alt).getAttribute('src')

describe('photo previews', () => {
  // StrictMode (main.jsx) runs every effect and ref twice in development; a preview must survive that.
  it('shows a blob preview that is not revoked while the photo is on screen, even under StrictMode', async () => {
    const user = userEvent.setup()
    render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    )

    await user.upload(document.getElementById('photos'), [file('one.png'), file('two.png')])

    for (const name of ['one.png', 'two.png']) {
      const src = shown(name)
      expect(src).toMatch(/^blob:/)
      expect(revoked.has(src)).toBe(false)
    }
  })

  it('revokes the preview when the photo is removed and when the form goes away', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Harness />)
    await user.upload(document.getElementById('photos'), [file('one.png'), file('two.png')])
    const first = shown('one.png')
    const second = shown('two.png')

    await user.click(screen.getByRole('button', { name: 'one.png: sil' }))
    expect(revoked.has(first)).toBe(true)
    expect(revoked.has(second)).toBe(false)

    unmount()
    expect(revoked.has(second)).toBe(true)
  })

  it('keeps the previews of the other photos when one becomes the main photo', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.upload(document.getElementById('photos'), [file('one.png'), file('two.png')])
    const [a, b] = [shown('one.png'), shown('two.png')]

    await user.click(screen.getByRole('button', { name: 'Əsas şəkil et' }))

    expect(shown('two.png')).toBe(b)
    expect(shown('one.png')).toBe(a)
    expect(revoked.size).toBe(0)
  })

  it('falls back to a message instead of a broken image when a photo cannot be shown', async () => {
    const user = userEvent.setup()
    render(<Harness currentUrl="/uploads/products/missing.png" />)
    await user.upload(document.getElementById('photos'), [file('one.png')])

    fireEvent.error(screen.getByAltText('one.png'))
    fireEvent.error(screen.getByAltText('Cari şəkil'))

    expect(screen.getAllByText('Şəkil göstərilə bilmir')).toHaveLength(2)
    expect(screen.queryByRole('img', { name: 'one.png' })?.tagName).not.toBe('IMG')
  })

  it('shows the current server photo through the API address', () => {
    render(<Harness currentUrl="/uploads/products/old.png" />)

    expect(shown('Cari şəkil')).toBe(productImageSrc('/uploads/products/old.png'))
    expect(shown('Cari şəkil')).toMatch(/^https?:\/\/.+\/uploads\/products\/old\.png$/)
  })
})

describe('productImageSrc', () => {
  it('turns site paths, with or without a leading slash, into full API addresses and leaves full addresses alone', () => {
    expect(productImageSrc('/uploads/products/a.png')).toMatch(/^https?:\/\/[^/]+\/uploads\/products\/a\.png$/)
    expect(productImageSrc('images/b.jpg')).toMatch(/^https?:\/\/[^/]+\/images\/b\.jpg$/)
    expect(productImageSrc('https://khazar.test/images/c.jpg')).toBe('https://khazar.test/images/c.jpg')
    expect(productImageSrc(null)).toBe('')
    expect(productImageSrc('')).toBe('')
  })
})
