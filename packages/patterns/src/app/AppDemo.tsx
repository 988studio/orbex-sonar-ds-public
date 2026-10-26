import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MutableRefObject } from 'react'
import { Button } from '@orbex/sonar-components/button'
import { Dialog, DialogHost } from '@orbex/sonar-components/dialog'
import { ToastProvider, useToast } from '@orbex/sonar-components/toast'
import { EditCards } from '../patterns/EditGrid.tsx'
import { EditListPanel, LIST_DEFAULT, type Entry as ListEntry } from '../patterns/EditList.tsx'
import '../patterns/cards.css'
import '../patterns/edit.css'
import '../patterns/edit-list.css'
import SystemPanel, { useSystemNotices } from '../patterns/SystemPanel.tsx'
import { StockReleased } from '../patterns/InventoryCard.tsx'
import { Assistant } from './Assistant.tsx'
import { Customize, Unbuilt } from './Panels.tsx'
import { PhoneNav, PhoneTop, Sidebar, ThemeScope, TopBar } from './Shell.tsx'
import './app-demo.css'

/**
 * The whole app frame, live: sidebar, top bar and the overview, with Customize overview, the AI assistant and the
 * page for modules that are not built yet. Desktop is the product’s 1440 × 980 canvas, drawn 1:1 or fitted to the
 * width (the product’s own fit: one scale for the whole canvas, laid out at 1440 and drawn smaller as one picture, so
 * nothing reflows); tablet is 820 × 1180 with the rail;
 * phone is 390 × 844.
 */
type Size = 'S' | 'M' | 'L' | 'XL'
type Entry = { id: string; size: Size; hidden?: boolean }
type Layout = Record<string, Entry[]>
const HEIGHTS: Record<Size, number> = { S: 245, M: 375, L: 405, XL: 535 }
const GAP = 20
const SIZE: Record<string, Size> = { orders: 'M', deliveries: 'L', shipments: 'XL', inventory: 'S', balance: 'M', recurring: 'L' }
const DESK: Layout = {
  c1: [{ id: 'orders', size: 'M' }, { id: 'deliveries', size: 'L' }],
  c2: [{ id: 'shipments', size: 'XL' }, { id: 'inventory', size: 'S' }],
  c3: [{ id: 'balance', size: 'M' }, { id: 'recurring', size: 'L' }],
}
/* The tablet reads the desktop’s cards top to bottom and puts each in the shorter column */
const TAB: Layout = {
  t1: [{ id: 'orders', size: 'M' }, { id: 'balance', size: 'M' }, { id: 'recurring', size: 'L' }],
  t2: [{ id: 'shipments', size: 'XL' }, { id: 'deliveries', size: 'L' }, { id: 'inventory', size: 'S' }],
}
/* Phones read the desktop row by row: Orders, Daily shipments, Balance, Deliveries, Recurring orders, Inventory */
const PHONE: Layout = {
  p1: [{ id: 'orders', size: 'M' }, { id: 'shipments', size: 'XL' }, { id: 'balance', size: 'M' }, { id: 'deliveries', size: 'L' }, { id: 'recurring', size: 'L' }, { id: 'inventory', size: 'S' }],
}
const bottom = (column: Entry[]) => column.reduce((sum, e) => (e.hidden ? sum : sum + HEIGHTS[e.size] + GAP), 0)
const shortest = (layout: Layout) => Object.keys(layout).reduce((a, c) => (bottom(layout[c]!) < bottom(layout[a]!) ? c : a))
const clone = (layout: Layout): Layout => JSON.parse(JSON.stringify(layout))

type Device = 'desktop' | 'tablet' | 'phone'
const SCREEN: Record<Device, { w: number; h: number }> = { desktop: { w: 1440, h: 980 }, tablet: { w: 820, h: 1180 }, phone: { w: 390, h: 844 } }
/* Tablet: the rail is 60 px, the margins 24, two columns fill the rest. At 820 that is 2 × 346. */
const columnWidth = (device: Device) => (device === 'tablet' ? (SCREEN.tablet.w - 60 - 48 - GAP) / 2 : 370)

export interface AppDemoProps {
  device?: Device
  /** What is open when the demo loads */
  open?: 'customize' | 'chat' | null
  /** A sidebar section with no screen, open when the demo loads */
  page?: string | null
  /** Start with the sidebar folded into the rail (desktop) */
  collapsed?: boolean
  /** Show the 1:1 / Fit to width switch (desktop) */
  fitSwitch?: boolean
  /**
   * 1.1.1: the frame's theme when the demo loads. Dark by default, the dashboard's native mode, whatever the page's
   * theme; its View mode switch changes the frame only. `'page'` follows the page and switches it, as the product does.
   */
  theme?: 'dark' | 'light' | 'page'
}

export default function AppDemo({ device = 'desktop', open = null, page: firstPage = null, collapsed: firstCollapsed, fitSwitch = true, theme = 'dark' }: AppDemoProps) {
  const screen = SCREEN[device]
  const [dark, setDark] = useState(theme !== 'light')
  const scoped = theme !== 'page'
  const frameTheme = scoped ? (dark ? 'dark' : 'light') : undefined
  const [collapsed, setCollapsed] = useState(firstCollapsed ?? device !== 'desktop')
  const [slide, setSlide] = useState(false)
  const [panel, setPanel] = useState<'customize' | null>(open === 'customize' ? 'customize' : null)
  const [chat, setChat] = useState(open === 'chat')
  /* The bell's panel, System notifications, as in the product (1.0.0-alpha.18) */
  const [system, setSystem] = useState(false)
  const [notices, setNotices] = useSystemNotices()
  const unread = notices.filter((notice) => !notice.read).length
  const [page, setPage] = useState<string | null>(firstPage)
  const [layout, setLayout] = useState<Layout>(() => clone(device === 'tablet' ? TAB : device === 'phone' ? PHONE : DESK))
  const [saved, setSaved] = useState<Layout>(layout)
  const [added, setAdded] = useState<string | null>(null)
  const stage = useRef<HTMLDivElement>(null)
  /* Edit layout, as on the overview: the layout before editing, kept to cancel; null when not editing */
  const [before, setBefore] = useState<Layout | null>(null)
  const editing = before !== null
  const dirty = editing && JSON.stringify(layout) !== JSON.stringify(before)
  const [ask, setAsk] = useState<'reset' | 'discard' | 'customize' | null>(null)
  /* 1.1 (pending #20): Customize overview's Reset to default asks first, as v38 (App.jsx), then brings back the default
     modules, positions and sizes, kept as the saved layout; the sheet's predefined layout goes back to its first role */
  const [customizeReset, setCustomizeReset] = useState(0)
  const [announcement, setAnnouncement] = useState('')

  /* Fit to width: the canvas is laid out at its real 1440 px and drawn smaller as one picture (a transform, not CSS
     zoom: under zoom Safari measures and wraps the cards and charts at the zoomed size, so they reflowed into narrow
     squeezed columns). The fit box takes the scaled size, so nothing is cropped and no empty band is left. */
  const [fit, setFit] = useState(true)
  const box = useRef<HTMLDivElement>(null)
  const [room, setRoom] = useState(screen.w)
  useLayoutEffect(() => {
    /* The room is the demo's column, not the frame: a phone or tablet frame takes the drawn size, so measuring it
       would never let the drawing grow back */
    const el = box.current?.parentElement
    if (!el) return
    const measure = () => setRoom(el.clientWidth)
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(el)
    return () => watch.disconnect()
  }, [])
  /* Desktop follows the switch. Tablets and phones are drawn 1:1 whenever they fit and, in a narrower column (a
     390 px phone frame in a 358 px column), drawn smaller as one picture instead of being cut at the edge */
  const k = device !== 'desktop' || fit ? Math.min(1, room / screen.w) : 1

  const shown = Object.values(layout).flat().filter((e) => !e.hidden).map((e) => e.id)
  const setShown = (ids: string[], on: boolean) =>
    setLayout((current) => {
      const next = clone(current)
      for (const id of ids) {
        const where = Object.keys(next).find((c) => next[c]!.some((e) => e.id === id))
        if (!on && where) next[where] = next[where]!.filter((e) => e.id !== id)
        if (on && where) next[where] = next[where]!.map((e) => (e.id === id ? { ...e, hidden: false } : e))
        if (on && !where) {
          next[shortest(next)]!.push({ id, size: SIZE[id] ?? 'L' })
          setAdded(id)
        }
      }
      return next
    })
  /* Closing the sheet scrolls the overview to a module just switched on */
  useEffect(() => {
    if (panel || !added) return
    const card = stage.current?.querySelector<HTMLElement>(`[data-edit-id="${added}"]`)
    if (card && stage.current) stage.current.scrollTo({ top: card.offsetTop - 24, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    setAdded(null)
  }, [panel])

  const toggleCollapse = () => {
    setSlide(true)
    setCollapsed((c) => !c)
    setTimeout(() => setSlide(false), 520)
  }
  /* Release stock, as in v38: no page of its own; the Inventory card releases half of what is on hold (its ring and
     figures go down) and a toast says so at the foot of the overview, with Undo (1.0.0-alpha.21) */
  const [released, setReleased] = useState(false)
  const toast = useRef<ReturnType<typeof useToast> | null>(null)
  const nav = (label: string) => {
    setPanel(null)
    if (device !== 'desktop' && !collapsed) setCollapsed(true)
    if (label === 'Overview') return setPage(null)
    if (label === 'Release stock') {
      setPage(null)
      setShown(['inventory'], true)
      setReleased(true)
      toast.current?.({ message: 'Stock released', action: { label: 'Undo', onClick: () => setReleased(false) } })
      return
    }
    setPage(label)
  }

  /* ---------- Edit layout: the top bar's button (desktop, tablet) or Edit in the bottom app bar (phone) ---------- */
  const startEdit = () => {
    setPanel(null)
    setChat(false)
    setSystem(false)
    setPage(null)
    if (device !== 'desktop' && !collapsed) setCollapsed(true)
    setBefore(clone(layout))
    setAnnouncement(device === 'phone' ? 'Editing layout. Drag to reorder. Switch modules on or off and pick their size.' : 'Editing layout. Drag a card by its top handle. Pull the bottom handle to change its size.')
  }
  /* 1.1: on phones Edit layout puts its list in the overview's place; the overview may have been scrolled down, and
     the list opened at that offset. It opens at the top (prototype round 1, note 4). */
  useLayoutEffect(() => {
    if (editing && device === 'phone' && stage.current) stage.current.scrollTop = 0
  }, [editing])
  const endEdit = (keep: boolean) => {
    if (!keep && before) setLayout(before)
    if (keep) setSaved(clone(layout))
    setBefore(null)
    setAnnouncement(keep ? 'Layout saved.' : '')
  }
  /* The phone edits the overview as a list: shown cards in order, then the rest, hidden */
  const listFrom = (current: Layout): ListEntry[] => {
    const on = Object.values(current).flat().filter((e) => !e.hidden)
    return [
      ...on.map((e) => ({ ...LIST_DEFAULT.find((d) => d.id === e.id)!, size: e.size, hidden: false })),
      ...LIST_DEFAULT.filter((d) => !on.some((e) => e.id === d.id)).map((d) => ({ ...d, hidden: true })),
    ]
  }
  const listDone = (list: ListEntry[] | null) => {
    if (list) {
      const next = { p1: list.filter((e) => !e.hidden).map(({ id, size }) => ({ id, size })) }
      setLayout(next)
      setSaved(clone(next))
    }
    setBefore(null)
    setAnnouncement(list ? 'Layout saved.' : '')
  }

  const phone = device === 'phone'
  const tablet = device === 'tablet'
  const className =
    'oxa app' +
    (tablet ? ' t-tab' + (collapsed ? '' : ' s-over') : '') +
    (phone ? ' m-mob m-drawer' + (collapsed ? '' : ' s-over') : '') +
    (collapsed && !phone ? ' s-col' : '') +
    (slide ? ' s-anim' : '') +
    (editing ? ' s-edit' : '')
  const cards = (
    <EditCards
      className="edit-grid app-grid"
      style={{ ['--cols' as string]: Object.keys(layout).length, ...(device === 'desktop' ? {} : { ['--col' as string]: phone ? '100%' : `${columnWidth(device)}px` }) } as CSSProperties}
      layout={layout}
      setLayout={(update) => setLayout((current) => update(current))}
      editing={editing && !phone}
      zoom={k}
      mode={device}
      onAnnounce={setAnnouncement}
      customizeHref="/patterns/customize/"
      interactive
    />
  )
  /* Desktop and tablet: the bar at the foot of the overview while the layout is edited, as the product's */
  const editBar = editing && !phone && (
    <div className="edit-bar app-edit-bar" role="toolbar" aria-label="Edit layout">
      <p className="edit-bar-text">
        <strong>Editing layout</strong>
        <span>Drag a card by its top handle. Pull the bottom handle to change its size.</span>
      </p>
      <div className="edit-bar-actions">
        <button type="button" className="edit-reset" onClick={() => setAsk('reset')}>
          Reset to default
        </button>
        <Button size="small" variant="outlined" className="edit-cancel" onClick={() => (dirty ? setAsk('discard') : endEdit(false))}>
          Cancel
        </Button>
        <Button size="small" disabled={!dirty} onClick={() => endEdit(true)}>
          Save layout
        </Button>
      </div>
    </div>
  )
  /* The frame holds its panels, as the product's main area does: always transformed (scale(1) when drawn 1:1), so a
     side panel or a sheet opens inside the app's screen, under its top bar, not at the edge of the window */
  const frame = (
    <div className={className} style={{ width: screen.w, height: screen.h, transform: `scale(${k})`, transformOrigin: '0 0' } as CSSProperties}>
      <Sidebar label={`Main navigation, ${device} demo`} collapsed={collapsed} onCollapse={toggleCollapse} page={page} onNav={nav} customizeOn={panel === 'customize'} onCustomize={() => setPanel((p) => (p ? null : 'customize'))} />
      {(tablet || phone) && <div className="t-scrim" aria-hidden="true" onClick={() => !collapsed && toggleCollapse()} />}
      <Assistant frame={screen} open={chat} onClose={() => setChat(false)} k={k} resizable={device === 'desktop'} />
      <div className="main">
        {phone ? (
          <PhoneTop />
        ) : (
          <TopBar
            tablet={tablet}
            unread={unread}
            chatOn={chat}
            onChat={() => setChat((c) => !c)}
            systemOn={system}
            onSystem={() => {
              setPanel(null)
              setSystem((on) => !on)
            }}
            editing={editing}
            onEdit={() => (editing ? endEdit(true) : startEdit())}
          />
        )}
        {page && <Unbuilt label={page} onHome={() => setPage(null)} onTry={(t) => (t === 'Customize overview' ? (setPage(null), setPanel('customize')) : setPage(t))} />}
        {/* A demo inside the page: the overview is a named region, not a second main landmark, and its title sits
            under the page's own section heading */}
        <div ref={stage} className="stage" role="region" aria-label={`Overview, ${device} demo`} style={page ? { display: 'none' } : undefined}>
          {phone && !editing && (
            <div className="m-head">
              <div>
                <h3 className="m-h1">Overview</h3>
              </div>
            </div>
          )}
          {!page && (phone && editing ? <EditListPanel initial={listFrom(layout)} onDone={listDone} zoom={k} /> : cards)}
        </div>
        {editBar}
        {phone && <div className={'m-veil' + (chat || system ? ' on' : '')} aria-hidden="true" onClick={() => { setChat(false); setSystem(false) }} />}
        <SystemPanel open={system} onClose={() => setSystem(false)} notices={notices} setNotices={setNotices} />
        <div className="footer t12r">
          <a href="#" onClick={(event) => event.preventDefault()}>Support services</a>
          <a href="#" onClick={(event) => event.preventDefault()}>Sales services</a>
          <a href="#" onClick={(event) => event.preventDefault()}>Contact</a>
          <span className="r">2026 © Orbex</span>
        </div>
        {/* 1.1 (pending #8): phones get the sheet too, as v38 (the drawer's link and the search open it) */}
        {(
          <Customize
            open={panel === 'customize'}
            onClose={() => setPanel(null)}
            shown={shown}
            setShown={setShown}
            onSave={() => {
              setSaved(clone(layout))
              setPanel(null)
            }}
            onReset={() => setAsk('customize')}
            resetSignal={customizeReset}
          />
        )}
        {phone && (
          <PhoneNav
            unread={unread}
            on={editing ? 'edit' : !collapsed ? 'menu' : system ? 'alerts' : chat ? 'chat' : null}
            onPick={(id) => {
              if (id === 'edit') return editing ? undefined : startEdit()
              if (editing) return
              if (id === 'menu') {
                setChat(false)
                setSystem(false)
                toggleCollapse()
              }
              if (id === 'chat') {
                setCollapsed(true)
                setSystem(false)
                setChat((c) => !c)
              }
              if (id === 'alerts') {
                setChat(false)
                setCollapsed(true)
                setSystem((on) => !on)
              }
            }}
          />
        )}
      </div>
    </div>
  )
  return (
    <ThemeScope.Provider value={scoped ? { dark, setDark } : null}>
    <StockReleased.Provider value={released}>
    <ToastProvider label={`App notifications, ${device} demo`}>
    <ToastHook to={toast} />
    <div className="app-demo" data-device={device}>
      {device !== 'desktop' && k !== 1 && (
        <div className="app-demo-top">
          <span className="app-demo-scale" aria-live="polite">{`Drawn at ${Math.round(k * 100)}% to fit the page`}</span>
        </div>
      )}
      {device === 'desktop' && fitSwitch && (
        <div className="app-demo-top">
          <label className="app-demo-fit">
            <input type="checkbox" checked={fit} onChange={(e) => setFit(e.target.checked)} />
            Fit to width
          </label>
          <span className="app-demo-scale" aria-live="polite">
            {k === 1 ? '1:1, the frame scrolls sideways' : `Drawn at ${Math.round(k * 100)}%`}
          </span>
        </div>
      )}
      <div ref={box} className="app-demo-frame" data-fit={k !== 1 || undefined} tabIndex={k === 1 && device === 'desktop' ? 0 : undefined} aria-label={k === 1 && device === 'desktop' ? 'App frame, scrolls sideways' : undefined}>
        <div className="app-demo-fit-box" data-theme={frameTheme} style={{ width: screen.w * k, height: screen.h * k }}>
          <DialogHost>{frame}</DialogHost>
        </div>
      </div>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      <div data-theme={frameTheme} style={{ display: 'contents' }}>
      <Dialog
        open={ask !== null}
        onOpenChange={(open) => !open && setAsk(null)}
        title={ask === 'discard' ? 'Discard changes?' : 'Reset to default layout?'}
        description={
          ask === 'reset'
            ? 'All cards go back to their original position and size. Changes you have not saved will be lost.'
            : ask === 'customize'
              ? 'The overview goes back to the default modules, positions and sizes.'
              : 'The changes you made to the layout will be lost.'
        }
        actions={
          <>
            <Button variant="text" onClick={() => setAsk(null)}>
              {ask === 'discard' ? 'Keep editing' : 'Cancel'}
            </Button>
            <Button
              onClick={() => {
                const fresh = () => clone(device === 'tablet' ? TAB : device === 'phone' ? PHONE : DESK)
                if (ask === 'reset') setLayout(fresh())
                else if (ask === 'customize') {
                  setLayout(fresh())
                  setSaved(fresh())
                  setCustomizeReset((n) => n + 1)
                } else endEdit(false)
                setAsk(null)
              }}
            >
              {ask === 'discard' ? 'Discard' : 'Reset'}
            </Button>
          </>
        }
      />
      </div>
    </div>
    </ToastProvider>
    </StockReleased.Provider>
    </ThemeScope.Provider>
  )
}

/* Hands the toast of the provider above to AppDemo, which renders that provider */
function ToastHook({ to }: { to: MutableRefObject<ReturnType<typeof useToast> | null> }) {
  to.current = useToast()
  return null
}
