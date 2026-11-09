import { describe, expect, it } from 'vitest'
import { DEPARTMENTS } from '@/features/hr/lib/hr-options'

describe('DEPARTMENTS', () => {
  it('offers İnsan resursları besides the existing departments', () => {
    expect(DEPARTMENTS).toEqual(['İdarə', 'Anbar', 'Satış', 'Maliyyə', 'İnsan resursları'])
  })
})
