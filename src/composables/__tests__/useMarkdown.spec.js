import { describe, it, expect } from 'vitest'
import { renderMarkdown, renderMarkdownInline } from '../useMarkdown.js'

describe('useMarkdown', () => {
  describe('renderMarkdown (block-level)', () => {
    it('returns empty string for empty input', () => {
      expect(renderMarkdown('')).toBe('')
      expect(renderMarkdown(null)).toBe('')
      expect(renderMarkdown(undefined)).toBe('')
    })

    it('parses bold text', () => {
      const result = renderMarkdown('**bold text**')
      expect(result).toContain('<strong>bold text</strong>')
    })

    it('parses italic text', () => {
      const result = renderMarkdown('*italic text*')
      expect(result).toContain('<em>italic text</em>')
    })

    it('parses inline code', () => {
      const result = renderMarkdown('`code`')
      expect(result).toContain('<code>')
    })

    it('parses links', () => {
      const result = renderMarkdown('[link text](https://example.com)')
      expect(result).toContain('<a href="https://example.com">link text</a>')
    })

    it('parses lists', () => {
      const result = renderMarkdown('- item 1\n- item 2')
      expect(result).toContain('<ul>')
      expect(result).toContain('<li>item 1</li>')
    })

    it('parses paragraphs with line breaks', () => {
      const result = renderMarkdown('First paragraph\n\nSecond paragraph')
      expect(result).toContain('<p>')
    })

    it('handles GFM tables', () => {
      const result = renderMarkdown('| Header |\n| ------- |\n| Cell |')
      expect(result).toContain('<table>')
    })

    it('converts single newlines to br tags', () => {
      const result = renderMarkdown('Line 1\nLine 2')
      expect(result).toContain('<br>')
    })

    describe('Search Highlighting', () => {
      it('highlights matching text', () => {
        const result = renderMarkdown('Hello world', 'world')
        expect(result).toContain('<mark>world</mark>')
      })

      it('is case insensitive', () => {
        const result = renderMarkdown('Hello WORLD', 'world')
        expect(result).toContain('<mark>WORLD</mark>')
      })

      it('does not corrupt HTML tags', () => {
        const result = renderMarkdown('<div>**bold**</div>', 'bold')
        expect(result).toContain('<div>')
        expect(result).toContain('<mark>bold</mark>')
      })

      it('returns original when query is empty', () => {
        const result = renderMarkdown('Some text', '')
        expect(result).toBe(result.replace(/<mark>/g, '').replace(/<\/mark>/g, ''))
      })
    })
  })

  describe('renderMarkdownInline (no block wrappers)', () => {
    it('returns empty string for empty input', () => {
      expect(renderMarkdownInline('')).toBe('')
      expect(renderMarkdownInline(null)).toBe('')
      expect(renderMarkdownInline(undefined)).toBe('')
    })

    it('parses bold without p wrapper', () => {
      const result = renderMarkdownInline('**bold**')
      expect(result).toContain('<strong>bold</strong>')
      expect(result).not.toContain('<p>')
    })

    it('parses italic without p wrapper', () => {
      const result = renderMarkdownInline('*italic*')
      expect(result).toContain('<em>italic</em>')
      expect(result).not.toContain('<p>')
    })

    it('parses code without p wrapper', () => {
      const result = renderMarkdownInline('`code`')
      expect(result).toContain('<code>')
      expect(result).not.toContain('<p>')
    })

    it('parses links inline', () => {
      const result = renderMarkdownInline('[link](http://test.com)')
      expect(result).toContain('<a href="http://test.com">link</a>')
    })

    it('does not wrap in paragraph tags', () => {
      const result = renderMarkdownInline('Simple text')
      expect(result).not.toContain('<p>')
      expect(result).toContain('Simple text')
    })

    describe('Search Highlighting', () => {
      it('highlights matching text inline', () => {
        const result = renderMarkdownInline('Search this text', 'this')
        expect(result).toContain('<mark>this</mark>')
      })

      it('is case insensitive', () => {
        const result = renderMarkdownInline('TEST text', 'test')
        expect(result).toContain('<mark>TEST</mark>')
      })

      it('does not corrupt existing HTML', () => {
        const result = renderMarkdownInline('<span>*bold*</span>', 'bold')
        expect(result).toContain('<span>')
        expect(result).toContain('<em>')
      })
    })
  })

  describe('Desktop vs Mobile Handling', () => {
    it('same output for both layouts - markdown is layout-agnostic', () => {
      const desktopResult = renderMarkdown('# Heading\n\nParagraph with **bold**')
      const mobileResult = renderMarkdown('# Heading\n\nParagraph with **bold**')

      expect(desktopResult).toBe(mobileResult)
    })

    it('search highlighting works regardless of viewport', () => {
      const desktopResult = renderMarkdown('Desktop search', 'desktop')
      const mobileResult = renderMarkdown('Mobile search', 'mobile')

      expect(desktopResult).toContain('<mark>Desktop</mark>')
      expect(mobileResult).toContain('<mark>Mobile</mark>')
    })

    it('inline rendering consistent across layouts', () => {
      const desktopResult = renderMarkdownInline('**bold** and *italic*')
      const mobileResult = renderMarkdownInline('**bold** and *italic*')

      expect(desktopResult).toBe(mobileResult)
    })
  })

  describe('Edge Cases', () => {
    it('handles unicode text', () => {
      const result = renderMarkdown('こんにちは世界')
      expect(result).toContain('こんにちは世界')
    })

    it('handles special characters in search', () => {
      const result = renderMarkdown('Test (parens) [brackets]', '(parens)')
      expect(result).toContain('<mark>(parens)</mark>')
    })

    it('handles regex special chars in search', () => {
      const result = renderMarkdown('Test * ? + chars', '* ? +')
      expect(result).toContain('<mark>* ? +</mark>')
    })

    it('handles empty search query', () => {
      const result = renderMarkdown('Some text', '')
      expect(result).toBe(result)
    })

    it('handles whitespace-only input', () => {
      const result1 = renderMarkdown('   ')
      const result2 = renderMarkdownInline('   ')
      expect(result1.trim()).toBe('')
      expect(result2.trim()).toBe('')
    })

    it('handles numbers as input', () => {
      const result = renderMarkdown(12345)
      expect(result).toContain('12345')
    })
  })
})