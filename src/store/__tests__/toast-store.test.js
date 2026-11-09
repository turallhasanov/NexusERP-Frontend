import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let toasts

beforeEach(async () => {
  vi.useFakeTimers()
  vi.resetModules()
  toasts = await import('@/store/toast-store')
})

afterEach(() => {
  vi.useRealTimers()
})

describe('toast-store', () => {
  it('shows a toast and dismisses it after 4 seconds', () => {
    const { result } = renderHook(() => toasts.useToastStore())

    act(() => toasts.showToast('Kontragent uğurla silindi.'))
    expect(result.current.toasts).toEqual([{ id: 1, message: 'Kontragent uğurla silindi.', variant: 'success' }])

    act(() => vi.advanceTimersByTime(4000))
    expect(result.current.toasts).toEqual([])
  })

  it('does not stack the same error twice (interceptor + page reporting one failure)', () => {
    const { result } = renderHook(() => toasts.useToastStore())

    act(() => {
      toasts.showToast('Serverə qoşulmaq mümkün olmadı.', 'error')
      toasts.showToast('Serverə qoşulmaq mümkün olmadı.', 'error')
    })

    expect(result.current.toasts).toHaveLength(1)
  })

  it('keeps toasts that differ in message or variant', () => {
    const { result } = renderHook(() => toasts.useToastStore())

    act(() => {
      toasts.showToast('Saxlanıldı.', 'success')
      toasts.showToast('Saxlanıldı.', 'error')
      toasts.showToast('Başqa xəta', 'error')
    })

    expect(result.current.toasts).toHaveLength(3)
  })

  it('shows the same message again once the first one is gone', () => {
    const { result } = renderHook(() => toasts.useToastStore())

    act(() => toasts.showToast('Xəta', 'error'))
    act(() => vi.advanceTimersByTime(4000))
    act(() => toasts.showToast('Xəta', 'error'))

    expect(result.current.toasts).toHaveLength(1)
  })
})
