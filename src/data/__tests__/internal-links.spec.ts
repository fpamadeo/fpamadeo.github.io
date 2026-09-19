import { describe, it, expect } from 'vitest'
import writingData from '@/data/writing.json'
import experienceData from '@/data/experience.json'
import aboutData from '@/data/about.json'
import defaultWritingHighlightsData from '@/data/defaultWritingHighlights.json'

describe('internal links never use legacy hash routing', () => {
  const payloads = [
    ['writing.json', JSON.stringify(writingData)],
    ['experience.json', JSON.stringify(experienceData)],
    ['about.json', JSON.stringify(aboutData)],
    ['defaultWritingHighlights.json', JSON.stringify(defaultWritingHighlightsData)],
  ]

  it.each(payloads)('%s contains no /#/ hrefs', (_file, payload) => {
    expect(payload).not.toContain('/#/')
  })

  it('contains no hand-typed %23 escaped hash routes either', () => {
    const all = payloads.map(([, p]) => p).join('')
    expect(all).not.toMatch(/(?:href|\()["']?#\//)
  })
})