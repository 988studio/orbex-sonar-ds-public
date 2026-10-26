# Orbex Sonar-DB Design System

**Orbex Sonar-DB** is an open-source design system for data-dense dashboards: design tokens, React components and product patterns, with a full documentation site.

- **Live docs:** https://orbex-ds.sites.tab.bot/
- **License:** code under [MIT](LICENSE); documentation under [CC BY 4.0](LICENSE-docs)
- © 988©STUDIO

The design system behind Sonar-DB, the Orbex dashboard where logistics teams follow orders, deliveries and stock on desktop, tablet and phone. Built on Material 3 Expressive and tuned for dense figures.

Designed and built by 988©STUDIO. Orbex and Sonar-DB are an anonymized portfolio case study: the brand is fictional, the system is real.

## What is here

```
packages/tokens       Design tokens: W3C Design Tokens source, build, accessibility tests
packages/components   React components: native HTML first, Base UI for complex behavior, CSS on tokens
packages/patterns     The product's patterns as source (since 1.1): app shell, overview cards, panels, assistant…
site                  Documentation site (Astro), built from the packages it documents
```

The documentation covers foundations, layout, components with their sizes, variants and states, the patterns of the overview (its six cards in every size and the five optional ones, charts, search, feedback and loading, editing, all live), the app around it (the shell, the AI assistant, Customize overview and the page for unbuilt modules, drawn live from the product at 1440, 820 and 390 px) and accessibility: what the system does for WCAG 2.2 AA and how it is checked.

## Tokens

The source is in [`packages/tokens/src`](packages/tokens/src), in the [Design Tokens Community Group format](https://www.designtokens.org/tr/2025.10/format/), in three tiers:

1. **Palette** (`src/ref`): raw colors named by hue and CIELAB lightness, plus font families and weights. Neutrals are generated from [`palette.config.ts`](packages/tokens/palette.config.ts): the brand hue at a chroma that fades toward black and white.
2. **Roles** (`src/sys`): what each value is for: text levels, surfaces, borders, states, type roles, shape, spacing, elevation, motion and layout. Themed roles have a `.light.json` and a `.dark.json` with the same names.
3. **Components**: they read roles only, never the palette.

The build writes:

| File | Contents |
| --- | --- |
| `dist/tokens.css` | Custom properties in the `sonar.tokens` cascade layer. Themes apply on any element with `data-theme`, or follow the operating system. |
| `dist/type.css` | One class per type role, such as `.sonar-type-title-lg`. |
| `dist/tokens.json` | Every token resolved per theme, with descriptions. |
| `dist/index.js` | The same data as a typed ES module. |

Springs are stored as a duration and a bounce; the build turns them into CSS `linear()` easing curves ([`lib/spring.ts`](packages/tokens/lib/spring.ts)).

### Accessibility contract

[`lib/accessibility.ts`](packages/tokens/lib/accessibility.ts) lists the color pairs that must reach WCAG AA: 4.5:1 for every text level meant to be read, placeholders included, on every surface that carries text; 3:1 for disabled text, marks and control boundaries. Translucent tints, such as the notice backgrounds, are measured over the surfaces they sit on. `npm test` checks every pair in both themes; the documentation prints the same list with the measured ratios.

## Components

[`packages/components`](packages/components) holds one folder per component: the React component, its stylesheet and its entry point. The rules:

- **Native HTML first.** Buttons, switches, checkboxes, radios, fields, selects and dialogs are the browser's own elements, so they work before any script loads and with every assistive technology.
- **Base UI for complex behavior** (menus, tooltips, toasts): positioning, focus management and typeahead, unstyled.
- **Charts drawn here**, in SVG and CSS with the chart roles of the tokens: tick bars, ring charts, the trend chart and one legend for all of them, each its own entry point.
- **Plain CSS on tokens**, in the `sonar.components` cascade layer. Variants are data attributes. No CSS-in-JS, no utility framework.
- **One entry point and one stylesheet per component**: `@orbex/sonar-components/button` and `@orbex/sonar-components/button.css`.

The build writes `dist/api.json`, the props of every component read from the source, and fails when a component's script and styles pass 3 KB gzipped; the two larger budgets, the trend chart and the card at 4 KB, are named in the build with their reason. Tests run in a DOM with Testing Library and axe.

```css
/* In the app, once: the layer order, then the tokens */
@layer reset, sonar, app;
@import '@orbex/sonar-tokens/tokens.css';
```

## Patterns

[`packages/patterns`](packages/patterns) (`@orbex/sonar-patterns`, since 1.1) is the code the documentation draws its live patterns with, so an app imports them instead of copying them: the app shell (`app/Shell.tsx`, with the sidebar, the rail, the top bar and the phone bars), the AI assistant, Customize overview and the page for unbuilt modules (`app/`), the overview cards, panels, Edit layout and smart search with their sample data (`patterns/`), the overview grid and the theme helpers (`lib/`). It ships as TypeScript and CSS source for a bundler (Vite, Astro), built on the components and tokens. Its app chrome draws Material Symbols from `/fonts/material-symbols-outlined-orbex.woff2`: serve the copy in its `fonts/` folder at that path. When the shell is the whole window rather than a framed example, put `data-shell="window"` on it or an ancestor so it reads the device's safe areas.

```ts
import { Sidebar, TopBar, SearchSlot } from '@orbex/sonar-patterns/app/Shell.tsx'
import { desktopColumn } from '@orbex/sonar-patterns/lib/overview-grid.ts'
```

## Working on it

Requires Node 22.18 or later (TypeScript runs natively, without a compile step) and npm 11.

```sh
npm install
npm test          # build the tokens, check contrast, test the components
npm run check     # strict type checking of the tokens package and the site
npm run dev       # documentation site with live reload
npm run build     # tokens and static site, into site/dist
```

After changing `palette.config.ts`, regenerate the palette with `npm run palette -w @orbex/sonar-tokens`.

Every change to a package comes with a changeset (`npm run changeset`); tokens and components are versioned together.

The component pages draw hover, focus and press side by side. A PostCSS step of the site alone,
[`site/build/preview-states.mjs`](site/build/preview-states.mjs), copies those rules onto a `data-preview` attribute;
the packages are published unchanged.

## Deploying the site

`site/dist` is a static site with one HTML file per page. Any static host works (Vercel, Netlify, GitHub Pages, Cloudflare Pages): build command `npm run build`, output directory `site/dist`.

## License

Code: [MIT](LICENSE). Documentation (the `site` content): [CC BY 4.0](LICENSE-docs). © 2026 988©STUDIO
