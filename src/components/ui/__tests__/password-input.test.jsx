import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PasswordInput } from '@/components/ui/password-input'

describe('PasswordInput', () => {
  it('toggles between masked and visible text', async () => {
    render(<PasswordInput placeholder="pw" defaultValue="secret123" />)
    const input = screen.getByPlaceholderText('pw')
    expect(input).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: 'Şifrəni göstər' }))
    expect(input).toHaveAttribute('type', 'text')

    await userEvent.click(screen.getByRole('button', { name: 'Şifrəni gizlət' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('toggle is type="button" so it never submits the form', () => {
    render(<PasswordInput />)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})
