import react from '@astrojs/react'
import { defineConfig } from 'astro/config'
import previewStates from './build/preview-states.mjs'

export default defineConfig({
  trailingSlash: 'always',
  /* Keep the white space the pages are written with: compressing it glued words to the links that follow a line break */
  compressHTML: false,
  build: { format: 'directory', assets: 'assets' },
  devToolbar: { enabled: false },
  /* React renders the component demos. Without a client directive a demo ships no JavaScript at all */
  integrations: [react()],
  vite: {
    css: {
      /* Hover, focus and press shown side by side on the component pages; see build/preview-states.mjs */
      postcss: { plugins: [previewStates({ include: /[\\/](sonar-components|packages[\\/]components)[\\/]/ })] },
    },
  },
})
