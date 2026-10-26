import { createContext, Fragment, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { switchTheme } from '../lib/theme.ts'
import './app-tokens.css'
import './shell.css'

/**
 * The app shell of Sonar-DB, as the product draws it (Orbex · Prototype v38): the sidebar that folds into a 60 px
 * rail, the top bar, and on phones the top bar and the bottom app bar. Markup and CSS are the prototype’s.
 */

/** The Orbex sun: 24 rays, alternately long and short */
export function Sun({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2
        const r1 = i % 2 ? 4.5 : 3
        return <line key={i} x1={12 + Math.cos(a) * r1} y1={12 + Math.sin(a) * r1} x2={12 + Math.cos(a) * 11} y2={12 + Math.sin(a) * 11} stroke="var(--accent)" strokeWidth="1.1" strokeLinecap="round" />
      })}
    </svg>
  )
}

const NAV: { group?: string; label: string; icon: string; badge?: number }[] = [
  { label: 'Overview', icon: 'home' },
  { group: 'Operations', label: 'New order', icon: 'post_add' },
  { label: 'Release stock', icon: 'outbox' },
  { label: 'Credit', icon: 'account_balance_wallet' },
  { label: 'Product requests', icon: 'settings_suggest' },
  { group: 'Tracking', label: 'Orders', icon: 'receipt_long' },
  { label: 'Inventory', icon: 'inventory_2' },
  { label: 'Balance', icon: 'account_balance' },
  { group: 'Payments & documents', label: 'Delivery notes', icon: 'local_shipping' },
  { label: 'Payments', icon: 'payments', badge: 7 },
  { label: 'Invoices', icon: 'request_quote' },
  { label: 'Notes', icon: 'article' },
  { label: 'Catalog', icon: 'import_contacts' },
]

const BOOK = (
  <svg className="sico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6.5 2.5H19v15.5H7a2 2 0 0 0-2 2V4a1.5 1.5 0 0 1 1.5-1.5z" />
    <path d="M7 19.3H19V21.5H7a1.1 1.1 0 0 1 0-2.2z" />
  </svg>
)
const GEAR = (
  <svg className="sico" viewBox="0 0 24 24" aria-hidden="true">
    <polygon points="12.00,4.40 13.99,2.00 15.90,2.58 16.22,5.68 17.37,6.63 20.48,6.33 21.42,8.10 19.45,10.52 19.60,12.00 22.00,13.99 21.42,15.90 18.32,16.22 17.37,17.37 17.67,20.48 15.90,21.42 13.48,19.45 12.00,19.60 10.01,22.00 8.10,21.42 7.78,18.32 6.63,17.37 3.52,17.67 2.58,15.90 4.55,13.48 4.40,12.00 2.00,10.01 2.58,8.10 5.68,7.78 6.63,6.63 6.33,3.52 8.10,2.58 10.52,4.55" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="8" />
  </svg>
)
const SUPPORT: [string, ReactNode][] = [
  ['Help', <span className="ms qm" aria-hidden="true">question_mark</span>],
  ['User manual', BOOK],
  ['Video tutorials', <span className="ms f" aria-hidden="true">videocam</span>],
  ['FAQs', <span className="ms f" aria-hidden="true">folder</span>],
  ['Customize overview', GEAR],
]

/**
 * 1.1.1: an app frame can carry its own theme, apart from the page (the documentation's app demos open dark, the
 * dashboard's native mode, on a light page). AppDemo provides it with data-theme on the frame. Without a scope the
 * shell reads and switches the page's theme, as the product does.
 */
export const ThemeScope = createContext<{ dark: boolean; setDark: (dark: boolean) => void } | null>(null)

/** The theme the shell is drawn in: its ThemeScope's, else the page's, read from the document like the product's View mode switch */
function useDark() {
  const scope = useContext(ThemeScope)
  const read = () => {
    const theme = document.documentElement.dataset.theme
    return theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
  }
  const [dark, setDark] = useState(false)
  useEffect(() => {
    if (scope) return
    setDark(read())
    const watch = new MutationObserver(() => setDark(read()))
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => watch.disconnect()
  }, [scope])
  return scope ? scope.dark : dark
}

/** View mode: the scope's theme when there is one, else the page's (switchTheme) */
function useFlipTheme(dark: boolean) {
  const scope = useContext(ThemeScope)
  return () => (scope ? scope.setDark(!dark) : switchTheme(dark ? 'light' : 'dark'))
}

/**
 * 1.1.1: where an app that places its toasts over the page (ToastProvider inset) puts them on phones: 16 px above the
 * floating bottom bar (12 + 64 + 16). The safe area is added by the toast itself.
 */
export const PHONE_TOAST_BOTTOM = '92px'

export interface SidebarProps {
  collapsed: boolean
  onCollapse: () => void
  /** The page open, by its label; Overview when null */
  page: string | null
  onNav: (label: string) => void
  customizeOn?: boolean
  onCustomize: () => void
  /** The landmark's name; each demo frame on a page names its own */
  label?: string
}

export function Sidebar({ collapsed, onCollapse, page, onNav, customizeOn, onCustomize, label = 'Main navigation' }: SidebarProps) {
  const dark = useDark()
  const flip = useFlipTheme(dark)
  const tip = (text: string) => (
    <span className="stip t12m" role="tooltip">
      {text}
    </span>
  )
  /* 1.1.2 (988©STUDIO review 20261026-1451, note 1): a menu that opens over the page (the phone's drawer, the tablet's
     sidebar) opens at the top every time, not where it was scrolled the last time. Before paint, so it never shows the
     old place. The desktop sidebar that folds and unfolds in place keeps its scroll. */
  const side = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const el = side.current
    const app = el?.closest('.oxa')
    if (collapsed || !el || !app || !(app.classList.contains('m-mob') || app.classList.contains('t-tab'))) return
    el.scrollTop = 0
    const inner = el.querySelector<HTMLElement>('.side-in')
    if (inner) inner.scrollTop = 0
  }, [collapsed])
  return (
    <aside className="side" aria-label={label} ref={side}>
      <div className="brand">
        <Sun />
        <div className="wm">
          <b>ORBEX TM</b>
          <small>SONAR-DB</small>
        </div>
        <button type="button" className="collapse" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} onClick={onCollapse}>
          <span className="ms cv" aria-hidden="true">{collapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}</span>
          {tip(collapsed ? 'Expand sidebar' : 'Collapse sidebar')}
        </button>
      </div>
      {/* 1.1 (prototype round 2, note 1; pending #14): the rows keep their v38 heights and this part scrolls when the
          window is too short for them (an iPad in landscape: about 1180 × 740), instead of squeezing every row to fit.
          The logo and the collapse button stay at the top. While it scrolls, the rail's tooltips are placed from the
          sidebar itself (tipAt), so the scroll does not cut them off. */}
      <div className="side-in" onPointerOver={tipAt} onFocus={tipAt} onScroll={(event) => event.currentTarget.querySelectorAll<HTMLElement>('.nav:hover, .sup:hover, .nav:focus-visible, .sup:focus-visible').forEach((row) => place(row))}>
      {NAV.map(({ group, label, icon, badge }) => {
        const on = (page ?? 'Overview') === label
        return (
          <Fragment key={label}>
            {group && <h6 aria-level={3}>{group}</h6>}
            <a
              className={'nav ' + (on ? 't14m on' : 't14r')}
              href="#"
              aria-current={on ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault()
                onNav(label)
              }}
            >
              <span className={'ms' + (on ? ' f' : '')} aria-hidden="true">{icon}</span>
              <span className="slbl">{label}</span>
              {badge !== undefined && (
                <span className="badge">
                  <span>{badge}</span>
                </span>
              )}
              {tip(label)}
            </a>
          </Fragment>
        )
      })}
      <div className="spacer" />
      <h6 aria-level={3} style={{ marginTop: 0, marginBottom: 12 }}>Support</h6>
      {SUPPORT.map(([label, icon]) => (
        <a
          key={label}
          className={'sup t11m' + (label === 'Customize overview' && customizeOn ? ' on' : '')}
          href="#"
          aria-expanded={label === 'Customize overview' ? !!customizeOn : undefined}
          onClick={(event) => {
            event.preventDefault()
            if (label === 'Customize overview') onCustomize()
            else onNav(label)
          }}
        >
          <span className="slbl">{label}</span>
          {icon}
          {tip(label)}
        </a>
      ))}
      <div className="viewmode t11m">
        <span>View mode</span>
        <span className="toggle">
          <span className="ms" aria-hidden="true">dark_mode</span>
          <span
            className="switch"
            role="switch"
            tabIndex={0}
            aria-checked={!dark}
            aria-label="Light mode"
            onClick={flip}
            onKeyDown={(event) => {
              if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault()
                flip()
              }
            }}
          />
          <span className="ms f" aria-hidden="true" style={{ color: 'var(--text-soft)' }}>
            light_mode
          </span>
        </span>
      </div>
      </div>
    </aside>
  )
}

/* Where a rail tooltip sits: level with its row, measured from the sidebar (its containing block while the rail
   scrolls), in the frame's own pixels when the app is drawn scaled */
function place(row: HTMLElement) {
  const side = row.closest<HTMLElement>('.side')
  if (!side) return
  const s = side.getBoundingClientRect()
  const r = row.getBoundingClientRect()
  const k = side.offsetHeight ? s.height / side.offsetHeight : 1
  row.style.setProperty('--tip-y', `${Math.round(((r.top + r.height / 2 - s.top) / k) * 2) / 2}px`)
}
function tipAt(event: { target: EventTarget }) {
  const row = (event.target as Element).closest?.<HTMLElement>('.nav, .sup')
  if (row) place(row)
}

const CHEVRON = (
  <svg className="achev" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M2 4.5 7 9.5 12 4.5" />
  </svg>
)

/**
 * The app's own search in the top bar (1.1.0): an app passes a function that draws it (the prototype's smart search,
 * a SearchField variant="top-bar" in the pill); without it the bar draws the plain pill. On phones `onDone` closes
 * the open search bar once a result is chosen.
 */
export const SearchSlot = createContext<((props: { onDone?: () => void }) => ReactNode) | null>(null)

export function SearchPill({ onDone }: { onDone?: () => void } = {}) {
  const slot = useContext(SearchSlot)
  if (slot) return <>{slot({ onDone })}</>
  return (
    <div className="search">
      <span className="ms" aria-hidden="true">search</span>
      <input className="sinput t14r" placeholder="Search…" aria-label="Search" autoComplete="off" spellCheck={false} />
    </div>
  )
}

export interface TopBarProps {
  /** Tablet: account, search, then Edit layout, alerts, chat and the avatar */
  tablet?: boolean
  unread?: number
  chatOn?: boolean
  onChat?: () => void
  editing?: boolean
  onEdit?: () => void
  /** The bell's panel, System notifications, is open (1.0.0-alpha.18) */
  systemOn?: boolean
  onSystem?: () => void
}

export function TopBar({ tablet, unread = 3, chatOn, onChat, editing, onEdit, systemOn, onSystem }: TopBarProps) {
  const edit = (
    <button type="button" className={'lbtn' + (editing ? ' on' : '')} aria-pressed={!!editing} aria-label={editing ? 'Save layout' : 'Edit layout'} onClick={onEdit}>
      <span className="lb">
        {/* 1.1: as v38's top bar, the pill reads Save layout while editing, and pressing it saves */}
        <span className="lt">{editing ? 'Save layout' : 'Edit layout'}</span>
        <span className="ck ms" aria-hidden="true">
          check
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="7" y="7" width="4" height="4" rx="1.2" className="t1" />
          <rect x="13" y="7" width="4" height="4" rx="1.2" />
          <rect x="7" y="13" width="4" height="4" rx="1.2" />
          <rect x="13" y="13" width="4" height="4" rx="1.2" />
        </svg>
      </span>
    </button>
  )
  const bell = (
    <button
      type="button"
      className={'circ' + (systemOn ? ' on' : '')}
      aria-label={`System notifications${unread ? `, ${unread} unread` : ''}`}
      aria-expanded={!!systemOn}
      aria-haspopup="dialog"
      data-panel=""
      onClick={onSystem}
    >
      <span className="ms f" aria-hidden="true">notifications</span>
      {unread > 0 && <span className="dot" />}
    </button>
  )
  const chat = (
    <button type="button" className={'circ chat' + (chatOn ? ' on' : '')} aria-label="Chat with support" aria-expanded={!!chatOn} onClick={onChat}>
      <span className="ms f" aria-hidden="true">chat_bubble</span>
    </button>
  )
  if (tablet)
    return (
      <div className="top t-topA">
        <button type="button" className="accts t14m">
          <span className="al">All accounts</span>
          {CHEVRON}
        </button>
        <div className="sgrp t-sg">
          <SearchPill />
        </div>
        <div className="t-acts">
          {edit}
          {bell}
          {chat}
          <button type="button" className="t-avb" aria-label="Alex Moran, Delivery Manager. Account menu">
            <span className="av">A</span>
          </button>
        </div>
      </div>
    )
  return (
    <div className="top">
      <div className="user">
        <div className="av">A</div>
        <div>
          <div className="name t18m">Alex Moran</div>
          <div className="role t12ra">Delivery Manager</div>
        </div>
      </div>
      <div className="right">
        <button type="button" className="accts t14m">
          All accounts
          {CHEVRON}
        </button>
        <span className="vr" />
        {bell}
        {chat}
        <div className="sgrp">
          {edit}
          <SearchPill />
        </div>
      </div>
    </div>
  )
}

/** Phones: the sun, the account and a search button; search takes the whole bar when it opens, with Cancel beside it,
    and the field takes focus (1.0.0-alpha.23: the button did nothing), as in the product (v38 MobileTop) */
export function PhoneTop() {
  const [searching, setSearching] = useState(false)
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    /* Without scrolling: when the shell is the page (data-shell="window"), the bar sticks to the top and focusing its field
       must not take the page back to the top (1.1, prototype round 2) */
    if (searching) requestAnimationFrame(() => bar.current?.querySelector<HTMLInputElement>('.search input')?.focus({ preventScroll: true }))
  }, [searching])
  return (
    <div ref={bar} className={'top m-top' + (searching ? ' srch' : '')}>
      {searching ? (
        <>
          <SearchPill onDone={() => setSearching(false)} />
          <button type="button" className="m-cancel t14m" onClick={() => setSearching(false)}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <div className="m-brand" role="img" aria-label="Orbex Sonar-DB">
            <Sun />
          </div>
          <button type="button" className="accts t14m m-accts">
            <span className="al">All accounts</span>
            {CHEVRON}
          </button>
          <button type="button" className="m-ib" aria-label="Search" aria-expanded={false} onClick={() => setSearching(true)}>
            <span className="ms" aria-hidden="true">search</span>
          </button>
        </>
      )}
    </div>
  )
}

/**
 * Phones: actions, not destinations. Each button is marked while its sheet is open.
 * 1.1.1: a floating capsule (shell.css), the same in both themes: by default it is a dark-theme scope, so a light page
 * shows the dark bar. `theme="light"` draws it in the light theme; `theme="page"` follows the page.
 */
export function PhoneNav({ on, onPick, unread = 3, theme = 'dark' }: { on?: string | null; onPick?: (id: string) => void; unread?: number; theme?: 'dark' | 'light' | 'page' }) {
  const items: [string, string, string, number | 'dot' | null][] = [
    ['alerts', 'notifications', 'Alerts', unread > 0 ? unread : null],
    ['chat', 'chat_bubble', 'Assistant', null],
    ['edit', 'dashboard_customize', 'Edit', null],
    ['account', 'account_circle', 'Account', null],
    ['menu', 'menu', 'Menu', 'dot'],
  ]
  return (
    <nav className="m-nav" aria-label="Actions" data-theme={theme === 'page' ? undefined : theme}>
      {items.map(([id, icon, label, badge]) => (
        <button
          type="button"
          key={id}
          className={'m-tab' + (on === id ? ' on' : '')}
          aria-expanded={id === 'edit' ? undefined : on === id}
          aria-pressed={id === 'edit' ? on === id : undefined}
          data-panel={id === 'alerts' ? '' : undefined}
          onClick={() => onPick?.(id)}
          aria-label={badge === 'dot' ? `${label}, items need attention` : badge ? `${label}, ${badge} unread` : label}
        >
          <span className="m-ti">
            <span className={'ms' + (on === id ? ' f' : '')} aria-hidden="true">{icon}</span>
            {badge === 'dot' ? <span className="m-dot" aria-hidden="true" /> : badge ? <span className="m-badge" aria-hidden="true">{badge}</span> : null}
          </span>
          <span className="t11m">{label}</span>
        </button>
      ))}
    </nav>
  )
}
