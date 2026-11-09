import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from '@/components/error-boundary'

function Broken() {
  throw new Error('Cannot read properties of undefined (reading "map")')
}

function GoTo({ path }) {
  const navigate = useNavigate()
  return <button type="button" onClick={() => navigate(path)}>go {path}</button>
}

function renderApp(initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <GoTo path="/customers" />
      <ErrorBoundary>
        <Routes>
          <Route path="/sales" element={<Broken />} />
          <Route path="/customers" element={<h2>Kontragentlər</h2>} />
        </Routes>
      </ErrorBoundary>
    </MemoryRouter>,
  )
}

describe('ErrorBoundary', () => {
  let consoleError

  beforeEach(() => {
    // React and the boundary both log the caught error; keep the test output readable.
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders the page normally when nothing throws', () => {
    renderApp('/customers')

    expect(screen.getByRole('heading', { name: 'Kontragentlər' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the "Sistemdə xəta baş verdi" fallback instead of a blank page', () => {
    renderApp('/sales')

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sistemdə xəta baş verdi' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Səhifəni yenilə' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Ana səhifəyə qayıt' })).toBeEnabled()
  })

  it('shows the error message in development builds and logs the failure', () => {
    renderApp('/sales')

    expect(screen.getByText('Cannot read properties of undefined (reading "map")')).toBeInTheDocument()
    expect(consoleError).toHaveBeenCalledWith(
      '[ErrorBoundary] UI render failed:', expect.any(Error), expect.any(String),
    )
  })

  it('keeps everything outside the boundary working', () => {
    renderApp('/sales')

    expect(screen.getByRole('button', { name: 'go /customers' })).toBeInTheDocument()
  })

  it('recovers when the user navigates to another page', async () => {
    renderApp('/sales')
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'go /customers' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Kontragentlər' })).toBeInTheDocument()
  })
})
