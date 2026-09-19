import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync, writeFileSync } from 'node:fs'
import { buildSitemap } from './src/utils/sitemap'

function sitemapPlugin(): Plugin {
  return {
    name: 'vite-plugin-sitemap',
    apply: 'build',
    closeBundle: () => {
      const writingPath = fileURLToPath(new URL('./src/data/writing.json', import.meta.url))
      const entries = JSON.parse(readFileSync(writingPath, 'utf-8'))
      const xml = buildSitemap(entries)
      const outPath = fileURLToPath(new URL('./dist/sitemap.xml', import.meta.url))
      writeFileSync(outPath, xml)
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [vue(), sitemapPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})