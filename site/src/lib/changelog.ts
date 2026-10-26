/**
 * Every release of the system, newest first. Tokens and components are released together, so one version names both
 * packages. Entries follow Keep a Changelog: Added, Changed, Fixed and Deprecated; a release lists only what it has.
 */
export interface Release {
  version: string
  date: string
  summary: string
  added?: string[]
  changed?: string[]
  fixed?: string[]
  deprecated?: string[]
}

export const releases: Release[] = [
  {
    version: '1.1.4',
    date: 'October 26, 2026',
    summary: 'One fix after a 988©STUDIO iPhone recording of 1.1.3: the Deliveries alert triangle looked frozen and dim on iOS Safari. 1.1.3, 1.1.2, 1.1.1, 1.1.0 and 1.0.0 are unchanged; their zips stay as they were.',
    fixed: [
      'AlertMark blink sync now uses CSS animation-delay instead of setting startTime, fixing a frozen/dim triangle on iOS Safari. On a real iPhone the triangle stayed dim and went fully off for about a frame every 1.2 s until the page was touched (not reduced motion; Playwright’s WebKit did not show it). Each blinking mark now gets an animation-delay once, from the page’s clock, so every triangle still blinks on the same beat, including marks drawn later; nothing writes to the animation from script any more. On this site, examples that hold a blinking triangle are no longer skipped by content-visibility when out of view. Same keyframes and timing (in over 90 ms, on for 420 ms, out over 150 ms, off for the rest of 1.2 s); with reduced motion it still stays on.',
    ],
  },
  {
    version: '1.1.3',
    date: 'October 26, 2026',
    summary: 'Two fixes after 988©STUDIO reviews of 1.1.2: card lists still stopped on their rows with a mouse on a desktop, and the Deliveries alert triangle blinked out of step on this site. 1.1.2, 1.1.1, 1.1.0 and 1.0.0 are unchanged; their zips stay as they were.',
    fixed: [
      'Card lists on a desktop (988©STUDIO, 26 October: «sigue haciendo snap con ratón en escritorio»): 1.1.2 took the snap off only when the wheel’s events looked like a mouse’s, and a mouse can read as a trackpad (in Chromium at 2× scale each notch arrives as half a notch), so the rows still snapped. The snap no longer depends on the wheel: on a desktop (a pointer that hovers and is fine, `(hover: hover) and (pointer: fine)`: mouse or trackpad) card lists and scroll areas have no row snap and stop wherever the wheel leaves them, still eased with a mouse. Touch screens (phones, tablets) keep the stop on each row.',
      'Alert triangle in Deliveries, on this site (988©STUDIO, 26 October: the blink looked wrong on a phone): each triangle keeps the document’s clock (AlertMark, 1.0.0-alpha.23), but only once its example had woken up; until then it blinked on its own beat and jumped when the example woke, a second or more after it came into view in Safari. The pages now put every triangle on the same clock from the first frame. Same animation and timing; with reduced motion it still stays on.',
    ],
  },
  {
    version: '1.1.2',
    date: 'October 26, 2026',
    summary: '988©STUDIO reviews of the prototype on 1.1.1: where the sidebar’s rows disappear when it scrolls, a menu that reopened where it was left, and the mouse wheel in card lists without the stop on each row. 1.1.1, 1.1.0 and 1.0.0 are unchanged; their zips stay as they were.',
    fixed: [
      'Sidebar and rail, when the column scrolls (988©STUDIO, iPad): the rows disappeared 32 px below the top bar, under the logo’s margin (at 101 px; the bar ends at 69). They now disappear level with the foot of the top bar: the logo row and the top bar share one height (--top-h, 69 px; on a tablet both add the same safe area) and the logo’s 32 px of air moved inside the scrolling column, so at rest every row stays where it was. Phones are unchanged: the drawer scrolls whole, logo included.',
      'Menu (988©STUDIO review 20261026-1451, note 1): the phone’s drawer and the tablet’s sidebar reopened where they had been scrolled the last time. A menu that opens over the page now opens at the top every time (Sidebar, before the first frame). The desktop sidebar, which folds in place, keeps its scroll.',
    ],
    changed: [
      'Mouse wheel in lists that stop on their rows (988©STUDIO review 20261026-1451, note 2: smooth scroll without the snap, with a mouse only): a card list a mouse wheel scrolls keeps its snap off and stops wherever the wheel leaves it, still eased; in 1.1.0 it eased to the nearest row after each turn of the wheel, which felt like a jump in short lists such as Recurring orders. The first touch or pen gives the snap back; touch screens, trackpads and the keyboard are unchanged.',
    ],
  },
  {
    version: '1.1.1',
    date: 'October 26, 2026',
    summary: '988©STUDIO review of the prototype on 1.1.0: the phone’s search field, the logo’s last letter and the phone’s bottom bar, which now floats. The dashboard’s native mode is dark, so the app demos open dark on these light pages. 1.1.0 and 1.0.0 are unchanged; their zips stay as they were.',
    added: [
      'Floating bottom bar, phone (988©STUDIO, after the prototype’s A/B test): the same items, icons, labels, active pill and badges, drawn as a capsule that does not touch the edges. 12 px from each side and 12 px above the safe area, 64 px tall, the full corner radius, 8 px inside each end, elevation 2 instead of the hairline. The page scrolls under it and ends 100 px plus the safe area lower, so the last card clears it; the drawer ends in 76 px of room, so View mode clears it; it floats whole over the open drawer and steps aside while the layout is edited; toasts over the page sit 92 px up (PHONE_TOAST_BOTTOM).',
      'The capsule is the same in both themes: PhoneNav is a dark-theme scope (data-theme="dark" on the nav), so a light page shows the dark bar, with the dark theme’s surface, icons, labels, active pill and badges. Its shadow is the page’s. theme="light" or theme="page" draws it otherwise.',
      'Theme scopes inside the app: a data-theme on any element in the shell resolves the app’s names from that scope’s tokens, and the shell’s light and dark rules follow the nearest scope, so a dark frame inside a light page (or the reverse) draws as one theme.',
      'AppDemo theme (default dark) and ThemeScope: the frame carries its own theme and its View mode switch changes the frame only; theme="page" follows and switches the page, as the product does.',
    ],
    changed: [
      'The documentation’s app demos (App shell, AI assistant, Customize overview, Unbuilt module) open in dark, the dashboard’s native mode, whatever this site’s theme. The site itself still reads in light by default (or the system’s theme), and the card and overview specimens follow it.',
      'Phone bottom bar badge: the solid danger fill, as the system’s Badge, so its white numeral reads 4.53:1 in both themes (on the dark theme’s brighter danger it read 3.61:1).',
    ],
    fixed: [
      'Top-bar search (988©STUDIO, iPhone): the app shell’s resets drew a second green box inside the pill while typing, and took the clear button’s automatic left margin, so on touch screens the × sat over the text. The shell’s resets and its focus outline now leave the SearchField alone, as they leave dialogs and the cards; the pill keeps its own ring, and the clear button its own focus outline.',
      'Logo (988©STUDIO review 20261026-1337): the italic M of «TM» was clipped by 2 px at the end of the wordmark; the wordmark has 3 px of room inside its clip, and still fades when the sidebar folds.',
    ],
  },
  {
    version: '1.1.0',
    date: 'October 26, 2026',
    summary: 'What building the Orbex prototype on 1.0.0 asked of the system (pending items 1 to 21), 988©STUDIO review of 1.0.0 (smooth mouse wheel; the assistant’s conversation on phones) and the rail on short tablet screens. The patterns become a package, the top-bar search and the toasts get the product’s options, the sample data is v38’s own, and the sidebar keeps its rows and scrolls.',
    added: [
      'Patterns package, @orbex/sonar-patterns (1): the app shell, the overview cards and their panels, Customize overview, the AI assistant, Edit layout, smart search, the sample data, the overview grid and the theme helpers, as the source the documentation draws with. Apps import them instead of copying them.',
      'Search field, top-bar look (2, 16): variant="top-bar" fills the app bar’s 39 px search pill with a 22 px icon, 12 px text and an 18 px clear mark, as in v38; icon and clearIcon take the app’s marks. On touch screens its text is 16 px drawn at three quarters, so iOS does not zoom in and the pill looks the same.',
      'Search field, placement (3): popupClassName, align and popupWidth place and size the results from the app. Their head band and highlighted row read two new roles, surface.search-head and surface.search-active (v38: #F1F4F0 and #E0E9DD; dark #252C25 and #2E392E), checked for AA with every reading level.',
      'Search field, status icon (6): statusIcon draws a mark in the status line’s 28 px accent circle, such as the sparkle of a smart search.',
      'Toast (9, 10): inset centres the toasts on the main area and lifts them above a footer or a bottom app bar, as v38 does; closeButton={false} leaves out the close button, on the provider or on one toast. The close button stays by default.',
      'Smooth mouse wheel (22, 988©STUDIO review of 1.0.0): on a desktop with a mouse, each wheel step eases over about a quarter of a second, on the documentation pages and in every list that scrolls (cards, panels, the assistant). Touch screens, trackpads, the keyboard and scrollbars keep the browser’s own scrolling; with reduced motion the step lands at once. smoothWheel() in @orbex/sonar-components/scroll-area turns it on; every scroll area, card list and dialog does.',
      'Overview grid: desktopColumn and tabletColumn, the product’s fluid columns (12): 370 px at 1440 with the sidebar open, 425 folded; 346 at 820 on a tablet. v38’s 4- and 5-column layouts for very wide screens are not built yet.',
      'Layouts remembered per mode (13): loadLayout, saveLayout and forgetLayout keep one overview layout per mode, as v38 does in localStorage. The documentation’s examples start from the default.',
      'App shell: SearchSlot puts the app’s own search in the top bar (the bar draws the plain pill without it); data-shell="window" makes the shell read the device’s safe areas when it is the page (15). In the documentation’s frames they stay 0.',
      'Surface role surface.well-hover: the hover of a control drawn on the well (v38 .addbtn:hover: neutral 90, dark neutral 27).',
    ],
    changed: [
      'Sidebar and rail (prototype round 2, note 1; 14): every row keeps its v38 height and the part under the logo scrolls when the window is too short, instead of squeezing the rows to fit. On an iPad Pro 10.9” in landscape (about 1180 × 740 in Safari) the logo was pressed against the top edge and the Support icons were crushed into each other. The logo and the collapse button stay at the top; the rail’s tooltips still hang beside their row while it scrolls.',
      'Phone drawer (14): the rows keep their heights and the drawer scrolls under the bottom app bar, whose buttons stay on top of it, on a 64 px footer of the drawer’s own surface.',
      'Search field (4, 5): the first result is highlighted whenever the list opens or changes, so Enter takes it at once; Escape clears the text first and keeps the list, then closes it, as its documentation said.',
      'App shell, Edit layout (7): the pill reads Save layout while editing and saves when pressed, as v38. On phones the list opens at the top even when the overview had been scrolled.',
      'App shell, phones (8): Customize overview opens on phones too, as in v38.',
      'Customize overview, Reset to default (20): asks first («Reset to default layout?» · «The overview goes back to the default modules, positions and sizes.»), then brings back the default modules, positions and sizes, kept as saved, and the predefined layout menu goes back to its first role. It used to go back silently to the last saved layout.',
      'Sample data (11): every day’s deliveries and invoices are v38’s own (its hash of the ISO date, codes, figures and states): 04-139C has 1 item. Smart search says «deliveries & invoices» and finds INV-7712, due today, among the overdue, as v38.',
      'Unit menu (18): hovered, it also fills with an 8 % tint of its text, as v38’s pill.',
      'Search results: the status band and the highlighted row use the new search roles (v38’s colours) instead of the container surfaces.',
      'Search field, top-bar look: its results are placed against the window, so they stay under a top bar that sticks to the top of a page that scrolls.',
    ],
    fixed: [
      'Card lists and the mouse wheel (17): a list that stops on its rows pulled each wheel notch back to a row, so it stuttered. While a wheel turns over it the snap rests, and when the wheel stops the list eases once to a row, so a row that stops is never half under the fade. Touch keeps the snap.',
      'Orders card, New order (19): it lost its hover, because the pattern’s background shorthand wiped the button’s state layers. The pattern sets only the colour, and the hover is v38’s.',
      'AI assistant on touch screens (21, 23): the field is no longer focused when the sheet opens on a touch screen (with a mouse or keyboard it still is), the conversation takes a finger at once after the sheet rises, and its scroll does not pass to the page. In the documentation’s 390 × 844 phone frame the sample conversation is shorter than the sheet, so it has nothing to scroll until a question is asked; it scrolls as soon as it is longer.',
      'Phone top bar: opening the search no longer takes a page that scrolls back to the top when the shell is the page (prototype round 2).',
    ],
  },
  {
    version: '1.0.0',
    date: 'October 25, 2026',
    summary: 'First stable release, identical to alpha.24. Only the version number changes; tokens and components are now a fixed base, and anything new goes into a later minor release.',
  },
  {
    version: '1.0.0-alpha.24',
    date: 'October 25, 2026',
    summary: '988©STUDIO review of alpha.23 on a phone and a desktop: no glow left on a card after its panel closes, Recurring orders’ fade clear of Reorder, specimens cut as far from the right edge as they start from the left, green buttons on the Panels page, and a theme switch that holds its place on the screen.',
    changed: [
      'Recurring orders: at rest the bottom fade ends above Reorder, clear of the button by half the room from the button to the card’s foot, instead of level with it. Only this card; the others keep their fade.',
      'Specimens on the component pages: a grid wider than its block is cut as far from the block’s right edge as it starts from its left edge, and scrolled to its end it stops there too (it was cut 6 px short).',
      'Panels page: the buttons that open each panel are filled, in the system’s green, as the product’s buttons are. Nothing else changes colour.',
      'Side navigation (tablets and desktops): the column is held by the top and the bottom of the window itself, with no viewport unit, so the theme switch keeps one place on the screen whether Safari’s bar shows or hides, level with the signature’s line when the page is scrolled to its end. With the alpha.23 height it rose when the bar hid.',
    ],
    fixed: [
      'Dialog (side panels and sheets): on a phone, closing a panel opened from a row of a list that had been scrolled gave focus back to the whole list, with its focus ring, a glow around the card once the sheet had gone. Focus goes back to what opened the panel, without its ring after a tap; the ring still shows from the keyboard.',
    ],
  },
  {
    version: '1.0.0-alpha.23',
    date: 'October 25, 2026',
    summary: '988©STUDIO review of alpha.22 on a phone and a desktop: card lists that never lose a row while they scroll and reach down to their footer, panels that open from the window, a steady alert blink, a theme switch that stays put, search on the phone frame, and the assistant scrolling from the start.',
    changed: [
      'Scroll area and card lists: the list reaches down to the card’s footer, as in the product, and the first row lies right on the title’s rule, with as much room above its content as below it, at rest too. The list no longer stops at a whole number of rows with the room under it left empty (the large space at the foot of the optional cards). The bottom fade is the product’s 24 px; rows still stop on the rule, scrolling down or up, and the last stop puts a row on it too.',
      'Side panels and sheets that are not modal are placed against the window, as in the product: on phones the sheet rises from the bottom of the screen; on tablets and desktops the panel runs the full height of the window at its edge. They had been placed against the card, the example or the section that opened them. The drawn app frames still hold their own panels.',
      'Overview, New order: the same room above and below its add button, so the button and its two lines sit centred between the rules (the product has 9 px above and 6 below; the card keeps its height).',
      'Side navigation (tablets and desktops): its height is the window’s smallest, so the theme switch at its foot no longer moves when Safari’s bars grow or shrink or the page scrolls. Its scrollbar runs at the very edge of the column, clear of the links.',
    ],
    fixed: [
      'Cards: rows vanished while a list scrolled (the room under the last whole row was hidden during the scroll) and, in Safari, a list could re-measure itself mid-scroll and jump to another row when an example out of view was skipped by the browser and drawn again. Both are gone: a list no longer changes its height when it fits again, so skipping examples out of view, which keeps taps on Cards quick, no longer moves it.',
      'Alert mark: every blinking mark keeps one beat, on the product’s 1.2 s cycle (in 90 ms, on 420 ms, out 150 ms). Marks drawn at different moments blinked out of step.',
      'Scroll area example: the list drew a second rule under the title’s.',
      'App shell, phone frame: the search button opens the search across the top bar, with Cancel, as in the product.',
      'AI assistant: the conversation opens at its latest line and scrolls before the first message is sent.',
    ],
  },
  {
    version: '1.0.0-alpha.22',
    date: 'October 25, 2026',
    summary: '988©STUDIO review of alpha.21: even room around Previous and Next, a side navigation that stays still, lists that stop with even room on the title’s rule, Notifications as in v38, a lighter Cards page, and checks in Chrome, Edge and Firefox.',
    added: [
      'Notifications: the delay unfolds its help, “What to do in this case?”, with FAQs, Support, Contact and Call the driver, on a press anywhere on it but its code, as in v38 (the spatial unfold, 320 ms open and 200 ms closed). The list has v38’s nine notices.',
    ],
    changed: [
      'Previous and Next: the same room under them down to the signature’s rule as from the rule above them, 36 px each side (it was 36 above and 60 below). The same on every page.',
      'Side navigation (tablets and desktops): a column fixed to the window that scrolls on its own. At its top or bottom it no longer bounces, and the page does not scroll on with it; only the content bounces.',
      'Scroll area: a row that stops at the top lies on the title’s rule, with as much room above its content as below it, down to its own rule; the last stop mirrors the first. The area shows whole rows (or whole groups and files) at every stop, and the fades cover only the room inside a row (or between bands), so no row that has stopped is half covered. Checked in every card with a list: Invoices, Credit notes, Notifications, Latest documents, Scheduled orders, Deliveries and Recurring orders.',
      'Cards page: the live examples come to life as they come near (they waited for the page to be idle, all at once), and examples out of view are skipped by the browser until they come near, at their own height. After arriving and jumping to the end, nothing keeps the page busy.',
    ],
    fixed: [
      'Notifications: the notices touched each other; they are 8 px apart again, with v38’s rounded corners, and in dark mode take v38’s stronger bands.',
      'Scroll area: a list could keep measuring itself every frame, which kept heavy pages busy.',
    ],
  },
  {
    version: '1.0.0-alpha.21',
    date: 'October 25, 2026',
    summary: '988©STUDIO review of alpha.20: the side navigation on tablets, Previous and Next and the signature at the foot of short pages, lists that stop on their rows, Release stock and download notices in the demos, and fixes for touch.',
    added: [
      'Scroll area: the list stops on its rows, scrolling down or up, so the first row shown starts at the rule above it; with rows of one height it shows a whole number of them, so the last row ends at the rule below. Lists in a card (CardScroll) stop on their rows too.',
      'App shell: Release stock works as in the product. The Inventory card releases half of what is on hold (840 → 420 plt; the ring and the figures move to it) and a toast says “Stock released”, with Undo.',
      'Cards: the download buttons of Invoices, Credit notes and Latest documents, and Download PDF in Invoice details, say so with the system’s toast (“INV-0025698.pdf downloaded”), as in the product.',
    ],
    changed: [
      'Documentation site: on tablets (from 744 px) the side navigation is always there, as on the desktop, instead of the drawer. Examples and tables now follow the page’s own width, which is narrower beside the navigation. The product’s own rules (Layout › Navigation by device) are unchanged.',
      'Short pages: Previous and Next and the signature sit at the foot of the window; the space left over opens above the rule of Previous and Next.',
      'Signature: on tablets and desktops its line sits level with the theme switch at the foot of the navigation; on phones it has as much air below as between its rule and its line.',
      'AI assistant: on tablets, phones and any touch screen the window no longer resizes from its edges and corners, and the corner mark is gone; the button in its top bar still toggles its two sizes. With a mouse on the desktop it resizes as in v38.',
    ],
    fixed: [
      'Previous and Next answer the first tap. At the foot of the page a finger often arrives while the page still glides or bounces, and iOS kept that tap to stop the page; a tap that gets no click now follows the link. On touch they no longer take the hover state, and they wait for no double-tap.',
      'Panels: closing one with a press left a glowing ring around the list it was opened from (in Safari the list, not the button, had taken focus). Focus now goes back to what was pressed, without its ring; from the keyboard the ring returns as before.',
      'Edit layout in the App shell’s frames on the iPad: the cards could not be dragged by touch. While editing, a touch on a handle never starts a scroll, and the page refuses to scroll under a held card, whatever the frame’s scale.',
      'Cards page, 744–840 px: the anatomy key overflowed the page sideways; it now stacks by the page’s width.',
    ],
  },
  {
    version: '1.0.0-alpha.20',
    date: 'October 25, 2026',
    summary: 'Accessibility fixes from the audit, a smooth Edit layout drag on tablets and phones, Edit layout inside the app shell’s frames, a tablet preview of the assistant and a new Panels page.',
    added: [
      'Patterns › Panels: the six panels the overview opens (New order, Reorder, Invoice details, Order details, Delivery details and System notifications), side by side and live, with what opens each, its parts and how it opens on phones, tablets and desktops. Linked from Dialog and Navigation by device.',
      'App shell: Edit layout works inside the three frames, as on the overview. On desktop and tablet, cards get their handles, move and resize, and the bar at the foot saves, cancels or resets; on the phone, Edit opens the list to reorder, show, hide and size the cards.',
      'AI assistant: a tablet preview, at 820 × 1180, beside the desktop and phone ones.',
    ],
    changed: [
      'Panels that are not modal keep the keyboard: Tab and Shift+Tab go round inside them, and on phones the page behind a sheet is inert, so a screen reader stays in it. Escape, × and the return of focus work as before.',
      'The phone and tablet menu (☰) reports whether it is open, names what it will do (“Open navigation” or “Close navigation”), keeps Tab inside the drawer and makes the page behind it inert.',
      'System notifications, light theme: Mark all as read, Mark as read, See improvement and View update history take the accent text color (#047E2F, 5.08:1 on the panel), not the accent fill (#1A8838, 4.42:1).',
      'App examples: icons are hidden from screen readers, so “home Overview” now reads “Overview”; the examples no longer add a main region, a first-level heading or extra banners to the page, and each frame’s navigation has its own name.',
      'Home: on tablets and desktops the cover no longer repeats the version, which the navigation already shows; phones keep it.',
      'Tables that scroll sideways (Color, Elevation, Search, Accessibility) can be reached and scrolled with the keyboard.',
      'Cards and Overview: the examples respond to the keyboard as soon as the page is idle, not only after they scroll into view.',
      'The side navigation’s group names are plain labels, so a page’s heading list starts with its own title.',
      'Edit layout: with a finger, the move and remove handles answer in at least 44 × 44 px; nothing is drawn larger.',
    ],
    fixed: [
      'Edit layout on tablets and phones: a card dragged to another column froze, lifted, until the next touch. The card is now held by the grid, so it follows the finger across columns and drops into its slot.',
      'Edit layout: after a card changed column it could fly away from the pointer, and its first move sent it to the end of its own column. Where it lands is now worked out from the layout, and it stays under the pointer.',
    ],
  },
  {
    version: '1.0.0-alpha.19',
    date: 'October 25, 2026',
    summary: 'A small round after stage 3: the outline breathes evenly under its hairline, and on tablets the side panels slide in from the right edge as Navigation by device defines.',
    changed: [
      'Navigation: under the hairline, “Get started” now stands as far from the rule as Foundations stands from the last item of Get started (49 px of clear space each), on phones, tablets and desktops. It stood 16 px under the rule.',
      'Dialog on tablets (600 to 1279 px): the side panel moves as Layout › Navigation by device defines the details panel. It waits just past the right edge and slides all the way in, right to left, on the default spatial spring (320 ms), and slides back out the same way, without fading. Desktops keep the product’s panel motion (48 px in with a fade over 420 ms). With reduced motion it fades without moving.',
      'App examples: the frame decides the motion as well as the placement. A tablet frame slides its panels in from the right edge, a desktop frame uses the product’s panel motion and a phone frame raises its sheets, whatever the window. The app’s screen clips sideways, as a window does.',
    ],
    fixed: [
      'App examples on phones: the side panels of the tablet and desktop frames rose from the bottom like a sheet, because their motion followed the window instead of the frame.',
    ],
  },
  {
    version: '1.0.0-alpha.18',
    date: 'October 24, 2026',
    summary: 'Stage 3 of the phone review: the panels the product opens (System notifications from the bell, Order details from Scheduled orders) join New order, Reorder and the details panels; tablets keep panels at the side; phone sheets start where the product’s do; a new Scroll area component replaces the system’s scrollbar in every inner list; the Overview pushes cards down when one grows; and the optional cards’ groups unfold with the product’s animation.',
    added: [
      'Scroll area (Components › Scroll area): content that scrolls inside a fixed height, as the product’s lists do. No scrollbar of the system, a fade at each edge that has more, and the product’s 2 px indicator, shown while scrolling and a second after, that runs in the padding beside the area (or in a lane of its own) and never covers a row or its buttons. Keyboard scrolling while it scrolls; no tab stop when everything fits.',
      'System notifications: the panel the bell opens in the top bar of the app examples (Alerts on phones), as in the product: unread count with Mark all as read, each update with its date, time, description, See improvement and Mark as read, and View update history. The bell and the Alerts tab count what is still unread.',
      'Order details: Open order in Scheduled orders opens the order in the side panel, as in the product (order info, items with their pallets, schedule), and its row stays marked while the panel is open.',
      'Notifications card: the delayed delivery’s code opens its Delivery details, as in the product.',
    ],
    changed: [
      'Dialog: side panels stay at the side on tablets, from 600 px wide (it was 768 px, the product’s size class; an iPad mini in portrait now keeps them at the side, as approved for tablets). Phones keep the sheet from the bottom.',
      'Dialog on phones: the sheet starts 44 px from the top of the window, with its title 31 px under its edge, as in the product. It started 12 px lower, under the top bar.',
      'Dialog: the body of side panels and sheets scrolls without the system’s scrollbar, with the product’s indicator 4 px from the panel’s edge.',
      'Optional cards: the groups of Latest documents and Scheduled orders unfold with the product’s height animation, on the spatial spring in 300 ms, and fold back in 240 ms, with the chevron turning; at once with reduced motion. The row actions are the product’s 20 px rings (download, open order).',
      'Navigation: a hairline divides “Design system” from Get started, the same rule as beside the version.',
      'App examples: the frame holds its panels, under the app’s own top bar, and the frame decides the placement (a phone frame shows sheets on a desktop, a desktop frame keeps side panels on a phone).',
      'Card: the scroll indicator runs 4 px from the card’s edge, as in the product.',
    ],
    fixed: [
      'Inner lists (Cards › Optional cards and every panel): the system scrollbar was drawn over the download buttons, white in dark mode on iPhone. It is hidden; the indicator runs in the card’s padding, 14 px clear of the buttons.',
      'Patterns › Overview: when a card grows, such as Balance with its Payment calendar open, the cards under it in its column move down by as much, as in the product, at every width. They stayed in place and were hidden behind it.',
    ],
  },
  {
    version: '1.0.0-alpha.17',
    date: 'October 24, 2026',
    summary: 'Stage 2 of the phone review: Fit to width draws the whole app as one picture, the overview cards inside the app examples look as they do on the Overview page, the navigation heads its outline with “Design system”, Delivery details follows the product, and the optional cards scroll and unfold.',
    added: [
      'Cards › Optional cards: the lists scroll between the header and the footer, fading at the edge that has more, and the groups of Latest documents and Scheduled orders open and close (several can be open), as in the product. The group header is a button that reports whether it is expanded.',
    ],
    changed: [
      'Navigation: the logo and the version share the top row, the version after the rule where “Design system” sat; “Design system” now heads the outline, above Get started, Foundations and the rest. On phones, tablets and desktops.',
      'Delivery details, as in the product: the code, status and summary line stay under the title while the rest scrolls; sections are 51 px bands with the name in 14 px capitals, a 22 px chevron and the rule under each section; open sections show their fields in two columns, label over value; the driver row is 64 px with the initials on a 46 px disc and a 20 px call button (the whole number stays a 44 px target); the itinerary is set in 12 px. Invoice details shares the same sections and head.',
      'AI assistant, dark: the header takes a clearly stronger tone, #2E392E (the product’s active search row), a step above the window and the bubbles; its grey line moves to #9CA699 so it passes AA (4.78:1; it was 4.43:1). Light is unchanged. Flagged for review.',
      'App shell and AI assistant: the tablet and phone frames are drawn smaller as one picture when the page is narrower than them (a 390 px phone in a 326 px column), with the scale stated, instead of being cut at the edge.',
    ],
    fixed: [
      'Fit to width (App shell, AI assistant, Editing, Layout › Navigation): the frame is laid out at its real width and drawn smaller with one transform. It used CSS zoom, under which Safari measured and wrapped the cards and charts at the zoomed size, so they reflowed into narrow squeezed columns; the frame now takes exactly the drawn size, with nothing cropped.',
      'Overview cards inside the app examples: the product’s page resets (margins reverted to the browser’s, unstyled buttons and links, inline svg) no longer reach the system’s cards. They indented the figures, squeezed and cut the Daily shipments chart and dropped its pager, flattened the unit pills and the View buttons, cut New order in Orders and the payment calendar in Balance, and clipped the Inventory gauge.',
    ],
  },
  {
    version: '1.0.0-alpha.16',
    date: 'October 24, 2026',
    summary: 'Small corrections from the second review on a phone: the version leaves the top bar, the overview opens with its cards already in place, the page behind a menu, panel or dialog stays still, and spacing, alignment and color fixes across cards, search, the app examples and Customize overview.',
    added: [
      'Scroll lock: while a dialog, side panel, sheet or the navigation drawer is open, the page behind it does not scroll, by wheel, keyboard or finger (iOS Safari included), and it is exactly where it was when the layer closes. One shared lock in the components package, used by Dialog and by the documentation’s drawer, with tests.',
      'Customize overview: the predefined layouts menu offers five roles (Delivery manager, Warehouse supervisor, Purchasing manager, Transport planner, Accounts payable); choosing one changes the name only, as in the prototype.',
    ],
    changed: [
      'Version: it leaves the top bar on phones and tablets. It stays in the navigation drawer and at the foot of every page, and appears at the top of the home page, above the title.',
      'Trend chart: the daily series is drawn in short dashes, as in the product (2 px of line, 2.2 px of gap), in every trend chart; the legend draws it the same way.',
      'Search result: a status with its words takes a column as wide as the longest status, Scheduled (71 px), with the dot at its start, so the dots of every row line up.',
      'Orders: more room between the figures and the month pager below them (19 px, was 15) and between the pager and the legend (10 px, was 8); New order sits 8 px under the legend and the card still fits its height.',
      'AI assistant: the chat header takes the search’s surface, so it no longer has the color of the assistant’s bubbles.',
      'App shell: the Measures table has wider columns (the part 140 px, each device at least 200 px) and scrolls sideways on phones instead of squeezing its words.',
      'Delivery details: the alert mark beside Itinerary blinks like the one on the card’s row (still with reduced motion).',
    ],
    fixed: [
      'Overview: the cards are drawn in their columns from the first frame. Before, the page opened with three squeezed columns and rearranged them once the script measured; the columns now follow the overview’s width with a container query, and the cards enter in place.',
      'Unit menu: the chevron sits on the pill’s optical middle (0.25 px below its center, as in the product); it was 0.75 px high.',
      'Recurring orders: scrolled to the end, the button in the footer has 13 px above it, the same as between a row’s last line and its rule; it touched the last rule.',
      'Cards › Optional cards: 24 px between the text and the first specimen and between specimens; the figures touched each other. The fix is in the specimen figure, so every page that uses it gains the space.',
      'Orders in the app examples: the month pager no longer touches the tick bars and the legend no longer crowds it; the app’s CSS had reverted the card’s margins.',
      'Editing the overview, tablet frame: the 60 px rail shows the folded sidebar, icons only, as in the app shell; it showed the open sidebar cut off.',
      'Customize overview: the words of Save layout are centered on the pill (they sat 1.2 px low).',
    ],
  },
  {
    version: '1.0.0-alpha.15',
    date: 'October 24, 2026',
    summary: 'Corrections from the review on a phone: the top bar stays on top, the type no longer changes as a page loads, the charts return to their earlier drawing with working readings, and a link to a card lands on it in one scroll.',
    changed: [
      'Charts: tick bars, rings and the trend chart return to their 1.0.0-alpha.12 drawing, as asked: 14 px tick bars on a 3 px pitch, 96 ticks around a ring, the trend chart’s solid daily line with its dotted running total, legend markers, a guide line with a point on each series and the reading above the chart (“May 12, 350 plt, Cumulative (plt): 4,485 plt”). Daily shipments shows May up to today again, with the days still to come left open.',
      'Side panels and sheets: the body runs down to the rule above the actions and fades over its last 24 px while there is more below (22 px at the top while there is more above), the same fade as the lists inside cards.',
      'Fonts: until IBM Plex Sans arrives, text is set in a fallback sized to Plex’s width and line metrics (IBM Plex Sans Fallback, in the sans family), so nothing moves when it does.',
    ],
    fixed: [
      'Documentation top bar: examples no longer pass over it on phones and tablets. The editing handles and size chips of the cards and the top bars and assistant of the app examples drew above it.',
      'Type on load: the three weights of IBM Plex Sans used on every first screen are preloaded, and the site’s files with a content hash are kept by the browser, so pages no longer open in a fallback face and switch to Plex.',
      'Links to a card of the overview (“Go to Deliveries”) land on the card in one scroll, just below the top bar, instead of jumping three times while the grid takes its columns; with reduced motion the move is immediate.',
      'Text centered in pills: the unit menu, the calendar’s View button and the Recurring quick-action label had extra padding above their text, which sat up to 1.4 px low; every pill, button, chip and segmented control now centers its capitals within 0.6 px.',
      'Orders: New order has 9 px above the add button and 6 px below it, as in the product; the button no longer touches the line under it.',
      'Trend chart: a reading opened with a finger closes when you tap anywhere outside the chart.',
    ],
  },
  {
    version: '1.0.0-alpha.14',
    date: 'October 24, 2026',
    summary: 'The app around the overview: the shell, the AI assistant, Customize overview and the page for unbuilt modules, drawn live from the product, with the overview’s entrance, the blinking delay mark and the loading states.',
    added: [
      'App shell: the sidebar that folds into a 60 px rail, the top bar, the tablet’s rail and the phone’s top and bottom bars, live at 1440 × 980, 820 × 1180 and 390 × 844, with the product’s own markup and CSS. The View mode switch changes the page’s theme.',
      'Fit to width: the 1440 canvas drawn smaller with one zoom, the product’s own fit, in the app demos and in the desktop editing demo.',
      'AI assistant: the floating chat (340 × 460, moves by its header or the arrow keys, resizes from any edge between 300 × 380 and 640 × 820, toggles to 520 × 680) and the phone’s bottom sheet, with answer cards, suggestions and the thinking dots.',
      'Customize overview: the sheet that hangs from the top bar over a scrim, with the basic set, a switch per module (11), predefined layouts, Save layout and Reset to default. A module switched on lands at the foot of the shortest column and the overview scrolls to it.',
      'Unbuilt modules: the product’s 404 for a section with no screen yet, with what works and the way back to the Overview.',
      'Cards: the five optional cards, Invoices, Credit notes, Notifications, Latest documents and Scheduled orders, documented in their one size, L.',
      'Feedback: loading states. The search status shimmers while it reads a query, and the assistant shows three pulsing dots; the product has no skeleton screens.',
      'Overview: the cards rise in on first view, 440 ms each, 55 ms apart, with the tick bars filling after them.',
      'Calendar: the delay mark beside 04-127C blinks on a 1.2 s cycle (in 90 ms, on 420 ms, out 150 ms).',
      'Color: a table of the roles where the product’s color fails WCAG AA and the system’s replaces it, with both ratios.',
    ],
    changed: [
      'Editing the overview: the tablet view is a true 820 px screen, the 60 px rail, 24 px margins and two columns of 346 px. The 341 px measured before came from a frame 810 px wide.',
      'Icon button: hover and press colors change in 160 ms on the decelerate curve, like the product’s round buttons. Buttons and segmented controls keep the product’s 200 ms radius and 212 ms spring.',
      'Search results: a delivery reads “04-127C 1 item · 15 plt”, with no separator after the code, as in the product.',
      'Trend chart: what a screen reader hears for a day matches its bubble: “May 12: 350 plt; until May 12, 4,135 plt”.',
      'Elevation: sheet is no longer deprecated; Customize overview uses it.',
    ],
    fixed: [
      'Color: the page now names the colors: the product’s light gray #737D71 reaches 4.21:1 on a card, below 4.5:1, so meta text takes #5E685D (5.71:1).',
      'Layout: the bottom app bar token describes its five actions.',
      'Dialog: the phone sheet example no longer mentions a scrim it does not have.',
    ],
  },
  {
    version: '1.0.0-alpha.13',
    date: 'October 23, 2026',
    summary: 'The overview at its real size, side panels without a scrim, an animated theme switch, and colors, charts and small parts brought exactly in line with the product.',
    added: [
      'Motion: fixed duration tokens for hover, panels, sheets, menus, search, tooltips, the theme switch and cards changing columns, with three new curves (accelerate, emphasized and crossfade). The Motion page lists them and describes the theme switch.',
      'Theme switch: the knob slides first, then the whole page cross-fades into the new theme in 700 ms. Without View Transitions, colors ease over 250 ms; with reduced motion, the change is immediate.',
      'Color: muted and meta text roles, and two anchored neutral families holding the product’s exact dark surfaces and grays. The Color page gives the contrast of each of these colors on cards.',
      'Text field: a suffix, such as the unit after a quantity.',
      'Status: the label can be hidden, leaving the dot with its name for screen readers.',
      'Dialog: non-modal side panels, which leave the page usable behind them, and a bottom sheet on phones that closes with a swipe down.',
    ],
    changed: [
      'Editing the overview: the demo draws the grid at 1:1, three columns of 370 px as on a 1440 px desktop or two of 341 px as on an 820 px tablet, in a frame that scrolls sideways. Tablet handles are larger. A lifted card grows to 103 %, neighbors make room in 320 ms, a dropped card glides into place in 500 ms, a resized card eases to its height, and cards travel to their new columns in 620 ms.',
      'Side panels: no scrim, below the top bar, 402 px wide with rounded leading corners and a soft shadow; the row that opened one stays marked. They arrive in 420 ms and leave in 150 ms. On phones, details open in a bottom sheet with a handle.',
      'Trend chart: the daily line dashed and the running total dotted, the whole month with axes from 0, ticks on the 1st, 15th and last day, the legend in plain text, and one figure at a time in a bubble beside its point.',
      'Unit menu: a small pill that stays a pill while open, with the units in capitals and no heading.',
      'Cards: Balance, Daily shipments, Orders, Inventory, Recurring orders and Deliveries match the product’s layout, figures and separators, including the out-of-stock line with its suggested swap and the reorder and new order panels.',
      'Menus, search results and tooltips open and close with the product’s timings.',
      'Phone navigation: the top bar holds the logo, the account switch and search; the bottom bar holds Alerts, Assistant, Edit, Account and Menu.',
      'Colors: dark surfaces, lines and grays, the secondary, muted, meta and disabled text, control borders, the scrim and the chart lines take the product’s values; each still meets its contrast minimum.',
      'Icons: chevrons at weight 500.',
    ],
  },
  {
    version: '1.0.0-alpha.12',
    date: 'October 23, 2026',
    summary: 'The editing demo with the cards’ real content, New element as the overview draws it, and steadier dragging on touch screens.',
    changed: [
      'Editing the overview on desktops: the demo shows each card with its content (charts, lists and rows), as the overview does, scaled with the grid. The modules New element adds arrive with their content too.',
      'New element: a dashed card of size S at the foot of the shortest column, with a plus and “Add a module to your overview”. It opens a list of modules, each with its icon and a line about it; the ones already on the overview are ticked, and the cards removed from it follow under “Removed from your overview”. Choose one or more and add them at once.',
    ],
    fixed: [
      'A hydration error (React #418) on Overview, Cards and Search: the side panels of the cards, closed on first paint, are no longer sent in the page’s HTML and mount once the example is live. The build fails if a closed panel’s form is sent again.',
      'Editing the overview on phones: dragging a row with a finger no longer gets stuck. The row lifts and follows, the others slide out of its way, and on release it settles into its place; the gesture always ends, however the browser ends it.',
      'Editing the overview at 390 px: the page no longer scrolls sideways.',
    ],
  },
  {
    version: '1.0.0-alpha.11',
    date: 'October 23, 2026',
    summary: 'Editing the overview drawn as the product draws it, on desktops and on phones, and examples that hydrate wherever the site is served.',
    changed: [
      'Editing the overview on desktops: a card in edit mode has a dashed accent edge, a move handle centered on its top edge, a red remove button outside its top end corner and a resize handle centered on its bottom edge with its size beside it. A card being moved lifts to elevation 4 without its edge, its handle turns solid and its slot shows the drop placeholder. The bar at the foot reads “Editing layout” with Reset to default, Cancel and Save layout, and New element brings cards and modules back.',
      'Cards: the state matrix and a new anatomy of a card in edit mode show those states, in light and dark. The states the overview does not draw are gone from the matrix.',
      'Editing the overview on phones: one line a card, with a grip, its name, its sizes and a switch, the hidden cards in a list of their own, and Reset to default, Cancel and Save layout fixed at the foot.',
      'Component pages show their facts as separate chips that wrap whole.',
      'Search result shows a page of this site as its third example.',
    ],
    fixed: [
      'A hydration error (React #418) on Overview, Cards, Search and other pages with live examples, where the site is served without HTML comments: every example now writes its text as single strings, and the build fails if one does not.',
      'Invoice details: quantities and amounts stay on one line, in tabular figures and aligned right; the product name takes the rest of the row.',
      'Spaces before links: words no longer run into the link that follows them.',
      'The top bar on phones keeps the wordmark and the version on one line.',
    ],
  },
  {
    version: '1.0.0-alpha.10',
    date: 'October 23, 2026',
    summary: 'All 23 components documented one by one, the states of a card while the overview is edited, and a site organized as a product.',
    added: [
      'Ten component pages: Card, Card link, Card scroll, Unit menu, Tick bar, Ring chart, Trend chart, Chart legend, Search field and Search result, each with examples, guidance, accessibility and its API.',
      'Cards: the states of a card while the overview is edited (rest, edit, hover and focus on a handle, lifted, drop slot, resizing, hidden and locked), with loading, error and empty, in light and dark; a numbered anatomy; and a live editing demo on a desktop grid with its edit bar.',
      'Do and don’t: examples drawn with the components on every component and pattern page.',
      'Get started › Installation: installing the packages, the cascade layers, the tokens and a first component on one page.',
      'Resources: this changelog, downloads (the tokens as CSS and JSON, the API and sizes of every component), llms.txt and contributing. The API is published at /api.json.',
      'Card tokens for the few values a card needs off the spacing scale, each named with its reason.',
      'ToastProvider takes a label, so a page with two providers names each region of toasts.',
      'Token data carries $deprecated, and the token tables mark a deprecated token with what to use instead.',
      'The site shows its version in the header and is signed in the footer of every page.',
    ],
    changed: [
      'The navigation has six sections: Get started, Foundations, Layout, Components, Patterns and Resources. “Cards and patterns” is now Patterns; Principles and Accessibility are part of Foundations.',
      'Code examples are self-contained: they import from @orbex/sonar-components and Material Symbols only, and can be copied and run as they are.',
      'The card layout styles use the spacing scale, or a named card token where a card needs its own value.',
      'Copy: American English throughout, and one way to write dates (May 12, 2026), units (20 px, 320 ms) and quotation marks.',
      'Side panels and bottom sheets keep the rows of their body at their own height, so Reorder’s review is compact; the actions stay at the foot.',
      'Prop descriptions for every prop of every component, and a props table for SearchField.',
    ],
    fixed: [
      'A hydration mismatch on Overview, Cards and Search: the ring chart rounds its coordinates, so the server and every browser draw the same numbers.',
      'Examples whose “Go to …” links led nowhere now lead to their card on the Overview page.',
      'Unit menu: its open state shows the open menu, at desktop and phone sizes.',
      'Deliveries: the week strip and the header show the same day.',
      'Navigation by device: the user’s name in the sidebar passes AA.',
      'Elevation: the token table shows the light and dark value of every shadow.',
      'The calendars keep the chosen day when the window is resized.',
    ],
    deprecated: ['elevation.sheet: no component hangs a sheet from the top bar. Use elevation.panel; the token goes in the next minor release.'],
  },
  {
    version: '1.0.0-alpha.9',
    date: 'October 23, 2026',
    summary: 'An Icons page, a complete elevation scale, and panels that confirm from the foot at any height.',
    added: [
      'Foundations › Icons: the marks the components draw, the Material Symbols the overview uses, their sizes, weight and use, and how to import them.',
      'Elevation tokens for the top bar, the sidebar edge and the edit bar, the edges of panels and sheets in both themes, and where each level is used.',
    ],
    changed: [
      'The week strip of the calendars is a native scroller that snaps day by day; a swipe or a flick lands on a day and chooses it.',
      'Side panels and bottom sheets keep their header and actions in place and scroll the body between them. Side panels cast the panel shadow.',
      'The grid simulator keeps one height at every width and redraws only when its width changes.',
    ],
    fixed: [
      'The grid simulator no longer holds on to the page’s scroll.',
      'Deliveries: the same space under the rule as above the date at every width, and a list that stops at the rule under its last whole row.',
      'Delivery details: the driver’s number shown is the number dialed.',
    ],
  },
  {
    version: '1.0.0-alpha.8',
    date: 'October 23, 2026',
    summary: 'Scrolling in one direction everywhere, and cards spaced on the overview’s grid.',
    added: ['Delivery details: a route map with the route, checkpoints and the truck by the state of the delivery, with zoom, pan, compass, scale and progress.'],
    changed: [
      'Every container that scrolls does so in one direction: tables, code and specimens sideways, menus, dialogs, the search list and the navigation up and down, with no bounce in the other direction.',
      'Cards: header, summary and rules at the same heights in every card, a rule under the title of cards without a summary, and the foot at the same height. Deliveries sets its day in a band between two rules that stay put while the rows scroll.',
      'The changelog folds by release, with the latest open.',
    ],
    fixed: [
      'Specimens keep room for focus rings and pressed states instead of cutting their first row.',
      'Search: the details panel looks the same from a result as from a card; pages and actions found take you to them; “overdue” leaves out invoices due today; the driver’s phone stays on one line on phones.',
    ],
  },
  {
    version: '1.0.0-alpha.7',
    date: 'October 23, 2026',
    summary: 'The six cards complete in every size, and search.',
    added: [
      'Patterns › Search: the smart search of the top bar, and a SearchField component on Base UI’s Autocomplete.',
      'RingChart takes a direction. Card takes a label for when the same card shows twice on a page.',
    ],
    changed: [
      'Deliveries: week and month views from March to June, a week strip that keeps the chosen day in the middle, an alert on a delayed delivery, an empty day that points to the next delivery, and View opening its details.',
      'Balance: the payment calendar, folded, with each invoice’s details. Orders: Previous and Next by name, and New order opening its panel. Daily shipments: a closed month shows its total.',
      'Inventory: on hold runs counterclockwise toward its figure. Recurring orders: a quick action, stock lines, an out-of-stock product with its alternative, and Reorder opening its review.',
      'Figures count to their new value when the unit changes.',
    ],
    fixed: ['Recurring orders XL fills its size with the list instead of leaving room at the foot.', 'Cards: region names no longer repeat when a card shows in several sizes.'],
  },
  {
    version: '1.0.0-alpha.6',
    date: 'October 23, 2026',
    summary: 'Cards that keep their header and footer in place, and a site that is easier to move around.',
    added: [
      'CardScroll: the list in a card that scrolls first when the card’s size leaves no room. The card’s budget is 4 KB, named in the build with its reason.',
      'An index page for each section, a breadcrumb on every page, and links to the previous and next page.',
    ],
    changed: [
      'Cards keep their header and footer in place and scroll what does not fit between them: no scrollbar, a fade at the edge that has more, a thin indicator while scrolling.',
      'Deliveries shows every delivery of the day and Recurring orders every product, scrolling when needed, instead of cutting the list.',
    ],
  },
  {
    version: '1.0.0-alpha.5',
    date: 'October 23, 2026',
    summary: 'Accessibility written down, and every size, variant and state on view.',
    added: [
      'Accessibility: the WCAG 2.2 AA commitments and how each is checked, and on every component page the keys it answers to and what it gives assistive technology.',
      'Sizes, variants and states on every component page, side by side, hover, focus and press included; each card in every size it offers.',
      'ChartLegend, under every chart that needs one.',
      'color.warning.container, in place of a tint mixed inside the notice. The contrast contract measures every notice tint over the card and the page.',
    ],
    changed: [
      'Tick bars draw one row of ticks for the whole bar: parts meet without a gap and no tick is split in two colors.',
      'The notice action takes the strong text level, which passes on every tint.',
      'The sample data agree with each other: every card reads Tuesday, May 12, 2026.',
      'The unit menu and the month and day buttons are named by the text they show.',
    ],
    fixed: [
      'Hidden text in Segmented control, Badge and Trend chart could widen a scrolling page; each component now contains its own.',
      'Pages open at the top, and long code scrolls inside its block.',
    ],
  },
  {
    version: '1.0.0-alpha.4',
    date: 'October 23, 2026',
    summary: 'The overview: its cards, charts and patterns.',
    added: [
      'Patterns: the six cards of the overview, built only from the system, and pages for charts, the overview, feedback and editing the overview.',
      'Components: Card with CardLink and UnitMenu, TickBar, RingChart and TrendChart, Notice, and Toast on Base UI. Each chart is its own entry point.',
    ],
    changed: [
      'Calendars leave the days of other months empty.',
      'A chart series that is turned off keeps its name at the tertiary level, with a hollow marker.',
      'The order of the cascade layers is declared before any stylesheet, so a bundler can never put the reset after the system.',
    ],
    fixed: ['List markers showed beside lists drawn as layouts. Every list with role="list" drops its markers.'],
  },
  {
    version: '1.0.0-alpha.3',
    date: 'October 22, 2026',
    summary: 'The first components.',
    added: [
      'A new package, @orbex/sonar-components: Button, IconButton, Badge, Status, Switch, Checkbox, SegmentedControl, TextField, SelectField, Menu, Tooltip and Dialog. Native HTML first; Base UI for the menu and the tooltip.',
      'One entry point and one stylesheet per component, a 3 KB gzipped budget each, and the props of every component published as data (api.json) and in /llms.txt.',
      'Tokens for control and icon sizes, and the focus ring (color.focus, at 3:1 or more on every surface).',
      'Changesets: tokens and components are released together.',
    ],
    changed: ['Cascade layers: the system lives under one layer, sonar, with tokens and components inside. Apps put their reset before it and their own styles after: @layer reset, sonar, app.'],
  },
  {
    version: '1.0.0-alpha.2',
    date: 'October 22, 2026',
    summary: 'Contrast on every surface, and layout tokens.',
    added: [
      'Layout tokens: size classes, card heights, margins, bars and the drawer. Groups keyed by size class follow the window, and sizeClasses gives scripts the same breakpoints.',
      'Pages: Breakpoints and grid, Navigation by device.',
    ],
    changed: [
      'Tertiary text is neutral 43 in light and 65 in dark, so it passes AA on containers and selected rows too.',
      'Placeholders read at the tertiary level; disabled text is held at 3:1.',
      'Danger text in dark is a lighter red, which passes on selected rows.',
      'Layout values sit on the 2 px base: desktop margins are 32 px, the top bar 68 px.',
      'Breaking: layout.sidebar.expanded and layout.sidebar.collapsed are renamed layout.sidebar and layout.rail, so they no longer share names with the size classes.',
    ],
    fixed: ['Contrast is never lowered with opacity; days outside the month are not shown, and decorative previews are hidden from assistive technology.'],
  },
  {
    version: '1.0.0-alpha.1',
    date: 'October 18, 2026',
    summary: 'The first release: the tokens.',
    added: [
      'Tokens in the W3C Design Tokens format, as CSS custom properties and typed data.',
      'A palette whose neutrals are generated from the brand hue, named by lightness.',
      'Six text levels defined by contrast; colored text roles (accent, danger, warning) in their own tones; a danger.solid role for badges.',
      'Named type roles, and motion springs stored as a duration and a bounce, with curves generated by the build.',
    ],
    changed: [
      'The brand green is #1A8838 (0.8 ΔE from #1E8A3A), so white text on green buttons reaches 4.5:1.',
      'In dark, text on green buttons is dark green, at 5.3:1.',
    ],
  },
]
