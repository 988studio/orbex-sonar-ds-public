# @orbex/sonar-patterns

The patterns of the Orbex Sonar-DB Design System as source, since 1.1.0: the code the documentation site draws its
live patterns with, so an app imports them instead of copying them.

- `app/` — the app shell (sidebar and rail, top bar, phone top bar, bottom app bar and drawer; `SearchSlot` puts the
  app's own search in the top bar), the AI assistant, Customize overview, the page for unbuilt modules, and the framed
  `AppDemo` the documentation shows.
- `patterns/` — the six overview cards and the optional ones, their panels (details, New order, Reorder, System
  notifications), Edit layout (grid and phone list), the smart search engine and the sample data (v38's own).
- `lib/` — the overview grid (with the product's fluid columns), layouts remembered per mode, the theme helpers.
- `icons.tsx` — the Material Symbols the patterns draw.

It ships TypeScript and CSS for a bundler (Vite, Astro). The app chrome reads Material Symbols from
`/fonts/material-symbols-outlined-orbex.woff2`: serve `fonts/material-symbols-outlined-orbex.woff2` at that path. When
the shell is the window itself, put `data-shell="window"` on it or an ancestor so it reads the safe areas.

Designed and built by 988©STUDIO. MIT.
