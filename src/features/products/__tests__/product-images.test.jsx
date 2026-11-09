import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ProductImageField } from '../components/ProductImageField'
import { addFiles, makeMain, splitPhotos } from '../lib/product-images'

const file = (name, size = 10, type = 'image/png') => new File([new Uint8Array(size)], name, { type, lastModified: 1 })

describe('photo helpers', () => {
  it('the first file is the main photo and the rest are gallery photos', () => {
    const [a, b, c] = [file('a.png'), file('b.png'), file('c.png')]

    expect(splitPhotos([a, b, c])).toEqual({ image: a, gallery: [b, c] })
    expect(splitPhotos([])).toEqual({ image: null, gallery: [] })
  })

  it('keeps the current photo as the main one: every new file is a gallery photo', () => {
    const [a, b] = [file('a.png'), file('b.png')]

    expect(splitPhotos([a, b], true)).toEqual({ image: null, gallery: [a, b] })
  })

  it('makes a chosen file the main one without losing the others', () => {
    const [a, b, c] = [file('a.png'), file('b.png'), file('c.png')]

    expect(makeMain([a, b, c], 2)).toEqual([c, a, b])
    expect(makeMain([a, b, c], 0)).toEqual([a, b, c])
  })

  it('ignores a file picked twice and stops at the limit', () => {
    const [a, b, c] = [file('a.png'), file('b.png'), file('c.png')]

    expect(addFiles([a], [file('a.png'), b], 8)).toHaveLength(2)
    expect(addFiles([a], [b, c], 2)).toHaveLength(2)
  })
})

function Harness({ currentUrl = null, onChange = () => {}, onError = () => {} }) {
  const [files, setFiles] = useState([])
  const [removeCurrent, setRemoveCurrent] = useState(false)

  return (
    <ProductImageField
      inputId="photos"
      files={files}
      onFilesChange={(next) => {
        onChange(next)
        setFiles(next)
      }}
      onError={onError}
      currentUrl={currentUrl}
      removeCurrent={removeCurrent}
      onRemoveCurrentChange={setRemoveCurrent}
    />
  )
}

describe('ProductImageField', () => {
  beforeEachUrl()

  it('is optional and allows several files at once', () => {
    render(<Harness />)

    expect(screen.getByText('Şəkil (istəyə bağlı)')).toBeInTheDocument()
    expect(screen.getByText('Şəkilsiz də saxlamaq olar')).toBeInTheDocument()
    expect(document.getElementById('photos')).toHaveAttribute('multiple')
  })

  it('shows a thumbnail per file, marks the first as the main photo and can promote another', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)

    await user.upload(document.getElementById('photos'), [file('one.png'), file('two.png'), file('three.png')])

    const tiles = within(screen.getByRole('list', { name: 'Şəkillər' })).getAllByRole('listitem')
    expect(tiles).toHaveLength(3)
    expect(within(tiles[0]).getByText('Əsas şəkil')).toBeInTheDocument()
    expect(within(tiles[1]).queryByText('Əsas şəkil')).not.toBeInTheDocument()

    await user.click(within(tiles[2]).getByRole('button', { name: 'Əsas şəkil et' }))

    expect(onChange).toHaveBeenLastCalledWith(expect.arrayContaining([]))
    const reordered = within(screen.getByRole('list', { name: 'Şəkillər' })).getAllByRole('listitem')
    expect(within(reordered[0]).getByAltText('three.png')).toBeInTheDocument()
    expect(within(reordered[0]).getByText('Əsas şəkil')).toBeInTheDocument()
  })

  it('removes one photo', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.upload(document.getElementById('photos'), [file('one.png'), file('two.png')])

    await user.click(screen.getByRole('button', { name: 'one.png: sil' }))

    const tiles = within(screen.getByRole('list', { name: 'Şəkillər' })).getAllByRole('listitem')
    expect(tiles).toHaveLength(1)
    expect(within(tiles[0]).getByText('Əsas şəkil')).toBeInTheDocument()
  })

  it('rejects other file types', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const onError = vi.fn()
    render(<Harness onError={onError} />)

    await user.upload(document.getElementById('photos'), file('x.gif', 10, 'image/gif'))

    expect(onError).toHaveBeenCalledWith('Yalnız JPEG, PNG və WebP şəkilləri qəbul olunur.')
    expect(screen.queryByRole('list', { name: 'Şəkillər' })).not.toBeInTheDocument()
  })

  it('keeps the current photo as the main one and replaces it when a new file is made main', async () => {
    const user = userEvent.setup()
    render(<Harness currentUrl="/uploads/products/old.png" />)

    await user.upload(document.getElementById('photos'), [file('new.png')])
    let tiles = within(screen.getByRole('list', { name: 'Şəkillər' })).getAllByRole('listitem')
    expect(tiles).toHaveLength(2)
    expect(within(tiles[0]).getByAltText('Cari şəkil')).toBeInTheDocument()
    expect(within(tiles[0]).getByText('Əsas şəkil')).toBeInTheDocument()

    await user.click(within(tiles[1]).getByRole('button', { name: 'Əsas şəkil et' }))

    tiles = within(screen.getByRole('list', { name: 'Şəkillər' })).getAllByRole('listitem')
    expect(tiles).toHaveLength(1)
    expect(within(tiles[0]).getByAltText('new.png')).toBeInTheDocument()
    expect(within(tiles[0]).getByText('Əsas şəkil')).toBeInTheDocument()
  })
})

// jsdom has no object URLs.
function beforeEachUrl() {
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview')
  globalThis.URL.revokeObjectURL = vi.fn()
}
