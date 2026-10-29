# Changelog

The full history, release by release, is on the documentation site (Resources › Changelog), written from
`site/src/lib/changelog.ts`. This file records the latest release.

## 1.1.6 — October 29, 2026

Restaurado estado de clic cuadrado en botones: the press shape of the approved videos (v38) is back on the two pills that had lost it. Nothing else changes; 1.1.5 and earlier are unchanged and their zips stay as they were.

### Fixed
- Unit menu: squarer while pressed again, 10 → 6 px on the 200 ms spatial spring, as v38’s pill and the videos; open, it is a pill again. The menu opens on press, which takes `:active` away from the trigger, so `UnitMenu` marks its own press (`data-pressing`, while the pointer is down). Removed in 1.0.0-alpha.13, when the pill was redrawn to stay a pill while open.
- Calendar View button (Deliveries): squarer while pressed again, 10 → 6 px, as v38’s View pill. Its own 10 px radius (`.cal-rows .sonar-button.cal-view`, outside the components layer) outranked Button’s press shape; the pattern now states its pressed radius.

## 1.1.5 — October 28, 2026

Four fixes from the usage rules (the system’s grammar of nouns, verbs and surfaces), and the documentation made readable by search engines and agents. Nothing else changes on screen. 1.1.4 and earlier are unchanged; their zips stay as they were.

### Added
- For search engines and agents (nothing visible): `robots.txt` (everything allowed), `sitemap.xml` and `llms-full.txt` (every documentation page as Markdown, in reading order), both written from the built pages (`site/build/agent-files.mjs`); a canonical link and JSON-LD on every page (`SoftwareSourceCode` for the system: version, MIT, 988©STUDIO; each page a `TechArticle` under CC BY 4.0).
- `llms.txt`: version, licence and source, links to the machine-readable files (`tokens.json`, `api.json`, `sizes.json`, `llms-full.txt`, `sitemap.xml`), and “Usage rules for agents”, the 37-line grammar for composing screens with the system (`site/src/lib/usage-rules.ts`).

### Fixed
- Sidebar only navigates (usage rule 9). Release stock left the sidebar’s Operations group: it is now the Inventory card’s own action, a text button in the card’s header beside the unit menu (24 px tall, so the card’s content keeps its place). It still acts at once, the toast still says “Stock released” with Undo, and the button rests until Undo. An app provides the action through `ReleaseStock` (`InventoryCard.tsx`); a card drawn without it has no button. Search still offers Release stock.
- One name per object: “notifications” now names only the operational alerts (the Notifications card). The bell’s panel, the product’s own news, is “What’s new” (was System notifications), and so is its button in the phone’s bottom app bar (was Alerts) and its accessible name (“What’s new, 2 unread”).
- One place to edit the overview (usage rule 10): Edit layout. Customize overview left the sidebar’s Support group, and the module sheet it opened is now “All modules”, reached from the New element card while editing the layout (the link read Customize overview). In search the action reads Edit layout and starts it. On phones the modules are switched in Edit, as before.
- Phones: no scrim under What’s new or the AI assistant, as the Panels guide says (bottom sheet, no scrim). The 32 % veil (`m-veil`) is gone from the app shell and the prototype; the sheets close with ×, a swipe down or Escape, as before.

## 1.1.4 — October 26, 2026

One fix after a 988©STUDIO iPhone recording of 1.1.3. 1.1.3, 1.1.2, 1.1.1, 1.1.0 and 1.0.0 are unchanged; their zips stay as they were.

### Fixed
- AlertMark blink sync now uses CSS animation-delay instead of setting startTime, fixing a frozen/dim triangle on iOS Safari. On a real iPhone (documentation site, Cards › Deliveries, dark theme) the triangle stayed dim and dropped fully off for about one frame every 1.2 s until the page was touched; Playwright’s WebKit did not reproduce it. `AlertMark` (`Calendar.tsx`, since 1.0.0-alpha.23) and `Docs.astro` (1.1.3) no longer write `animation.startTime`. The new `patterns/blink.ts` gives each blinking mark `animation-delay: -(document.timeline.currentTime % 1200)ms` once, restarting the marks of one frame together (`syncBlink`); on the documentation site a `MutationObserver` covers marks added later (`watchBlink`). `Docs.astro` also no longer applies `content-visibility: auto` to examples that hold a blinking mark. Keyframes and timing in `panels.css` unchanged; reduced motion unchanged (no animation).

## 1.1.3 — October 26, 2026

Two fixes after 988©STUDIO reviews of 1.1.2. 1.1.2, 1.1.1, 1.1.0 and 1.0.0 are unchanged; their zips stay as they were.

### Fixed
- Card lists still stopped on their rows with a mouse on a desktop. 1.1.2 dropped the snap only when the wheel’s events looked like a mouse’s, and in Chromium at 2× scale a notch arrives as half a notch and read as a trackpad. Now the snap does not depend on the wheel: under `(hover: hover) and (pointer: fine)` (mouse or trackpad) `.sonar-card-scroll-area` and `.sonar-scroll-area-viewport` have `scroll-snap-type: none` (`card/styles.css`, `scroll-area/styles.css`), and the list stops where the wheel leaves it (still eased with a mouse). Touch screens keep the row snap. `internal/smooth-wheel.ts` no longer touches the snap (no `data-sonar-wheel`, no pointer listener); its wheel check only decides whether a step is eased.
- Alert triangle (Deliveries) on the documentation site: each `AlertMark` keeps the document’s clock only once its island hydrates (`client:visible`), so until then it blinked on its own beat and jumped at hydration (WebKit: up to a second or more after it came into view). `Docs.astro` now puts every `cal-alert-blink` animation on the document clock from the first frame (`startTime = 0` on `animationstart`/`animationiteration`, plus a first pass). Same keyframes and timing; reduced motion unchanged (no animation).

## 1.1.2 — October 26, 2026

988©STUDIO reviews of the prototype on 1.1.1: where the sidebar’s rows disappear when it scrolls, a menu that reopened where it was left, and the mouse wheel in card lists without the stop on each row. 1.1.1, 1.1.0 and 1.0.0 are unchanged; their zips stay as they were.

### Fixed
- Sidebar and rail, when the column scrolls: the rows disappeared 32 px below the top bar, under the logo’s margin (at 101 px; the bar ends at 69). They now disappear level with the foot of the top bar. The logo row and the top bar share one height, `--top-h` (69 px, `app-tokens.css`; on a tablet both add the same `--sa-t`), and the logo’s 32 px margin became the scrolling column’s top padding (`shell.css`), so at rest every row stays where it was. Phones unchanged (the drawer scrolls whole). Customize’s scrim also reads `--top-h` (same value).
- Menu: the phone’s drawer and the tablet’s sidebar open at the top every time (`Sidebar`, layout effect on `collapsed`); the desktop sidebar keeps its scroll.

### Changed
- Mouse wheel in lists that stop on their rows (`internal/smooth-wheel.ts`): with a mouse the snap stays off once the wheel has scrolled a list, which stops where the wheel leaves it (still eased); no more easing to the nearest row afterwards. The first touch or pen gives the snap back. Touch, trackpads and keyboard unchanged.

## 1.1.1 — October 26, 2026

988©STUDIO review of the prototype on 1.1.0: the phone’s search field, the logo’s last letter and the phone’s bottom bar, which now floats. The dashboard’s native mode is dark, so the app demos open dark on the documentation’s light pages. 1.1.0 and 1.0.0 are unchanged; their zips stay as they were.

### Added
- Floating bottom bar on phones (`PhoneNav`, `shell.css`): a capsule 12 px from each side and 12 px above the safe area, 64 px tall, `--sonar-shape-corner-full`, 8 px inside each end, `--sonar-elevation-2` instead of the hairline; same items, icons, labels, active pill and badges. Page bottom padding 100 px + safe area; drawer ends in a transparent 76 px spacer; floats over the open drawer; hidden while editing the layout; `PHONE_TOAST_BOTTOM` = 92 px for toasts over the page.
- The capsule is the same in both themes: `PhoneNav` is a dark-theme scope (`data-theme="dark"`, prop `theme`, default `'dark'`). Its shadow is the page’s (`--m-nav-shadow`).
- Theme scopes inside the app shell: the app’s names resolve again under any `[data-theme]`, and the shell’s light/dark rules follow the nearest scope.
- `AppDemo` `theme` (default `'dark'`) and `ThemeScope`: the demo frame carries its own theme; its View mode switch changes the frame only (`'page'` = as before).

### Changed
- The documentation’s app demos open in dark (the dashboard’s native mode); the site still reads in light by default.
- Phone bottom bar badge: solid danger fill (white 4.53:1 in both themes; it was 3.61:1 on the dark theme’s danger).

### Fixed
- Top-bar search: no inner green box while typing, and the × back at the right end on touch screens (the shell’s unlayered resets and focus outline no longer reach `.sonar-search`).
- Logo: the italic M of «TM» is no longer clipped (3 px of room inside the wordmark’s clip).

## 1.1.0 — October 26, 2026

What building the Orbex prototype on 1.0.0 asked of the system (pending items 1–21), 988©STUDIO review of 1.0.0 (22–23) and the rail on short tablet screens (prototype round 2, note 1). 1.0.0 is unchanged; its zip stays as it was. The numbers are the items of `DS-1.1-PENDIENTE.md`.

### Added
- `@orbex/sonar-patterns` (1): app shell, overview cards and panels, Customize overview, AI assistant, Edit layout, smart search, sample data, overview grid and theme helpers, as source. The site imports them from the package.
- SearchField `variant="top-bar"` (2, 16), `icon`, `clearIcon`, `statusIcon` (6), `popupClassName`, `align`, `popupWidth` (3). Roles `surface.search-head` and `surface.search-active` (v38 #F1F4F0 / #E0E9DD, dark #252C25 / #2E392E), in the AA checks (250 pairs).
- ToastProvider `inset` (9) and `closeButton` (10; on by default).
- Smooth mouse wheel (22): `smoothWheel()` in `@orbex/sonar-components/scroll-area`, on in every scroll area, card list, dialog and the site’s pages. Desktop with a mouse only: touch, trackpads, keyboard and scrollbars are untouched; instant with reduced motion.
- `desktopColumn`, `tabletColumn` (12; 4/5-column layouts not built), `loadLayout` / `saveLayout` / `forgetLayout` (13), `SearchSlot`, `data-shell="window"` for real safe areas (15), role `surface.well-hover` (19).

### Changed
- Sidebar and rail: rows keep their v38 height and the column under the logo scrolls on short windows (R2 note 1; 14). Phone drawer scrolls under the bottom bar, whose buttons stay on top (14).
- SearchField: first result highlighted on open/change (4); Escape clears, then closes (5); search roles for the head band and the highlighted row.
- App shell: «Save layout» while editing, saves on press (7); phones’ Edit layout opens at the top; Customize overview on phones (8); Reset to default asks, then restores the default (20).
- Sample data = v38 (11); Smart search «deliveries & invoices», overdue includes due today.
- Unit menu hover: 8 % text tint (18).

### Fixed
- Card lists vs. the mouse wheel: no pull-back per notch; one eased settle on a row (17).
- New order keeps a hover (v38’s) (19).
- Assistant on touch: no focus on open, the list scrolls at once, no chaining to the page (21, 23).
- Top-bar search: results placed against the window (they stay under a bar that sticks to the top of a scrolling page); the phone bar’s search no longer scrolls such a page back to the top.

## 1.0.0 — October 25, 2026

First stable release, identical to 1.0.0-alpha.24: only the version number changes. Tokens and components are a fixed base; anything new goes into a later minor release.

## 1.0.0-alpha.24 — October 25, 2026

988©STUDIO review of alpha.23 (sessions 4cmd, phone, and z54g, desktop).

### Changed
- Recurring orders card (demo, `cards.css`): at rest the bottom fade of its list ends 11 px above Reorder (half the 22 px from the button to the card's foot) instead of level with it; `--_fade-lift: 15px` (the list reaches 4 px past its end). Only this card.
- Specimen frames (`.specimen-frame`): `margin-right: 0; padding-right: 0` and no `max-width`, so a wide grid is cut at the block's inner edge, as far from the card's right edge as it starts from its left, and stops there at its end.
- Panels page: the openers are `variant="filled"`.
- Docs layout, side navigation ≥ 744 px: `inset: 0 auto 0 0; height: auto` (was `height: 100svh`). The theme switch hangs 16 px from the bottom of the window, not from its top.

### Fixed
- Dialog (not modal): focus is given back after the page behind a phone sheet is no longer inert, and again after `close()` if WebKit moved it to the element focused when the panel was shown (a scrolled card list, which drew its ring).
