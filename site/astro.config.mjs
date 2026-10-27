import react from '@astrojs/react'
import { defineConfig } from 'astro/config'
import agentFiles from './build/agent-files.mjs'
import previewStates from './build/preview-states.mjs'

export default defineConfig({
  /* 1.1.5: the public address, for canonical links, JSON-LD, the sitemap and the agent files (llms.txt, llms-full.txt) */
  site: 'https://orbex-ds.sites.tab.bot',
  trailingSlash: 'always',
  /* Keep the white space the pages are written with: compressing it glued words to the links that follow a line break */
  compressHTML: false,
  build: { format: 'directory', assets: 'assets' },
  devToolbar: { enabled: false },
  /* React renders the component demos. Without a client directive a demo ships no JavaScript at all */
  /* agentFiles writes sitemap.xml and llms-full.txt from the built pages (1.1.5) */
  integrations: [react(), agentFiles()],
  vite: {
    css: {
      /* Hover, focus and press shown side by side on the component pages; see build/preview-states.mjs */
      postcss: { plugins: [previewStates({ include: /[\\/](sonar-components|packages[\\/]components)[\\/]/ })] },
    },
  },
})
