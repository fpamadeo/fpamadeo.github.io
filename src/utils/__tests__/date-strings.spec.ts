import { describe, expect, it } from 'vitest'
import { parseDate } from '../dates'
import { initialsOf } from '../strings'

describe('parseDate', () => {
  it('returns a timestamp for a real date', () => {
    expect(parseDate('2020-06-01')).toBe(new Date('2020-06-01').getTime())
  })

  it('sorts undefined to the far future', () => {
    expect(parseDate(undefined)).toBeGreaterThan(new Date('2099-01-01').getTime())
  })

  it('sorts empty string to the far future', () => {
    expect(parseDate('')).toBeGreaterThan(new Date('2099-01-01').getTime())
  })

  it('sorts "Present" to the far future', () => {
    expect(parseDate('Present')).toBeGreaterThan(new Date('2099-01-01').getTime())
  })

  it('treats "Present" and an explicit end date consistently', () => {
    expect(parseDate('Present')).toBeGreaterThan(parseDate('2023-06-01'))
  })
})

describe('initialsOf', () => {
  it('builds a two-letter monogram from a full name', () => {
    expect(initialsOf('Franz Paul')).toBe('FP')
  })

  it('uppercases initials', () => {
    expect(initialsOf('franz paul')).toBe('FP')
  })

  it('handles extra whitespace between words', () => {
    expect(initialsOf('  Franz   Paul  ')).toBe('FP')
  })

  it('caps at two initials for long names', () => {
    expect(initialsOf('Franz Paul Amadeo')).toBe('FP')
  })

  it('returns a single initial for a single-word name', () => {
    expect(initialsOf('Madonna')).toBe('M')
  })
})
