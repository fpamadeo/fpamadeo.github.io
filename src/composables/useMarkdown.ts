/**
 * useMarkdown — lightweight markdown rendering utility
 *
 * REQUIRES: npm install marked
 * Run this once in your project root before using this composable.
 *
 * Uses `marked` (https://marked.js.org) with GitHub Flavored Markdown (GFM).
 *
 * Two exports:
 *   renderMarkdown(text)       — full block-level markdown (paragraphs, lists, etc.)
 *   renderMarkdownInline(text) — inline-only markdown (bold, italic, code, links)
 *
 * Both accept an optional second argument `searchQuery` to wrap matched
 * substrings in <mark> tags for search highlighting.
 * The highlight is applied after markdown parsing, targeting only text
 * nodes (not HTML tags) via a split-on-tag approach.
 */

import { marked } from 'marked'

// Configure marked once at module load
marked.use({
  gfm: true,    // GitHub Flavored Markdown: tables, strikethrough, task lists
  breaks: true, // Convert single \n to <br> (useful for multi-line JSON strings)
})

/**
 * Escape a string for safe use inside a RegExp.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Apply <mark> tags around `query` matches in already-rendered HTML.
 * Splits the HTML string on tag boundaries and only replaces within text nodes,
 * so existing HTML attributes and tag names are never corrupted.
 *
 * @param {string} html   - Already-rendered HTML string
 * @param {string} query  - Search query to highlight
 * @returns {string}      - HTML with <mark>…</mark> around matches
 */
function applySearchHighlight(html, query) {
  if (!query || !html) return html
  const pattern = new RegExp(`(${escapeRegex(query)})`, 'gi')

  // Split on HTML tags; only process the non-tag segments
  return html.replace(/(<[^>]*>)|([^<]+)/g, (match, tag, text) => {
    if (tag) return tag           // HTML tag — return unchanged
    if (!text) return ''
    return text.replace(pattern, '<mark>$1</mark>')
  })
}

/**
 * Render full block-level markdown (wrapped in <p>, <ul>, etc.)
 * Optionally highlights a search query in the output.
 *
 * @param {string} text
 * @param {string} [searchQuery]
 * @returns {string} HTML string — safe to bind with v-html
 */
export function renderMarkdown(text, searchQuery = '') {
  if (!text) return ''
  const html = marked.parse(String(text))
  return applySearchHighlight(html, searchQuery)
}

/**
 * Render inline-only markdown (bold, italic, code, links — no block wrappers).
 * Best used for short strings like Summary or tag labels where you don't
 * want a wrapping <p> tag.
 *
 * @param {string} text
 * @param {string} [searchQuery]
 * @returns {string} HTML string — safe to bind with v-html
 */
export function renderMarkdownInline(text, searchQuery = '') {
  if (!text) return ''
  const html = marked.parseInline(String(text))
  return applySearchHighlight(html, searchQuery)
}
