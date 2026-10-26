import { memo, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { AddIcon, MinusIcon, MyLocationIcon, ShippingIcon, ZoomOutMapIcon } from '../icons.tsx'

/*
 * The route map of Delivery details: streets, a river and parks drawn once, and over them the
 * route, its checkpoints and the truck, placed by the state of the delivery. It zooms (buttons, double click, + and -)
 * and, zoomed in, pans by dragging or with the arrow keys. A block at the foot says where the truck is, its last
 * stop and the destination, with the progress along the route.
 */

export interface RouteState {
  state: 'done' | 'late' | 'sched'
  origin: string
  cur: string
  last: string
  dest: string
  km: number
  eta: string
}

const BASE_W = 402
const MAP_H = 320
const K = 0.96
const TY = 66 - 20 * K
const LEVELS = [1, 1.5, 2, 3]
const NICE = [1, 2, 5, 10, 20, 50, 100, 200]
type Point = [number, number]
type View = { s: number; x: number; y: number }

/* ---------- The route, in the drawing’s own coordinates ---------- */
const ROUTE = (() => {
  const pts: Point[] = [
    [60, 20],
    [139.25, 86.04],
  ]
  /* Round the Route 9 roundabout, over the top */
  const a0 = Math.atan2(86.04 - 95, 139.25 - 150)
  const a1 = Math.atan2(102.3 - 95, 161.9 - 150)
  for (let i = 1; i <= 14; i++) {
    const a = a0 + ((a1 - a0) * i) / 14
    pts.push([150 + 14 * Math.cos(a), 95 + 14 * Math.sin(a)])
  }
  const r12 = pts.length
  pts.push([240, 150], [276, 90], [345, 70])
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1]! + Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]))
  const total = cum[cum.length - 1]!
  const split = (length: number) => {
    const len = Math.max(0, Math.min(total, length))
    let i = 1
    while (i < cum.length - 1 && cum[i]! < len) i++
    const t = (len - cum[i - 1]!) / (cum[i]! - cum[i - 1]! || 1)
    const a = pts[i - 1]!
    const b = pts[i]!
    const p: Point = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    return { done: [...pts.slice(0, i), p], rest: [p, ...pts.slice(i)], p }
  }
  /* Checkpoints, and where the truck broke down: a little after Route 12 */
  const LEN = { r9: cum[8]!, r12: cum[r12]!, late: cum[r12]! + 32 }
  return { pts, total, split, LEN }
})()
const line = (points: Point[]) => points.map((p) => p.join(',')).join(' ')

/* ---------- The base drawing ---------- */
const MINOR = ['-5,96 40,70 95,60', '92,46.1 146.7,48', '196,123.1 232,100 250,40', '138,102 120,150 96,182', '196,123 210,176 180,206', '250,40 276,90 240,150',
  '276,90 345,70 450,50', '100,46.4 95,60', '250,40 262,-60', '332,166 345,70', '180,206 172,330', '262,201 270,330', '-5,96 -60,126']
const MAJOR = ['-68,-60 60,20 139.25,86.04', '152,-60 146,40 150,81', '162.6,89 250,40 330,-5 428,-60', '138.8,103.4 70,170 0,215 -60,253.6',
  '161.9,102.3 240,150 300,190 450,234', '-60,156 42,126 96,182 180,206 262,201 332,166 375,158 450,144', '-60,262 160,270 320,262 450,256']
const Art = memo(function Art() {
  return (
    <>
      <rect x="-300" y="-300" width="1100" height="1100" fill="var(--map-bg)" />
      <path d="M8 150 L40 136 L64 160 L86 182 L60 196 L22 196 Z" fill="var(--map-park)" />
      <path d="M172 6 L238 6 L232 34 L178 38 Z" fill="var(--map-park)" />
      <path d="M300 -60 C318 40 296 82 308 120 C318 150 336 190 330 241 L338 400" fill="none" stroke="var(--map-water)" strokeWidth="20" />
      <g fill="none" stroke="var(--map-casing)" strokeLinecap="round" strokeLinejoin="round">
        {MINOR.map((p) => <polyline key={p} points={p} strokeWidth="4.6" />)}
        {MAJOR.map((p) => <polyline key={p} points={p} strokeWidth="8.6" />)}
        <circle cx="150" cy="95" r="14" strokeWidth="8.6" />
      </g>
      <g fill="none" stroke="var(--map-road)" strokeLinecap="round" strokeLinejoin="round">
        {MINOR.map((p) => <polyline key={p} points={p} strokeWidth="3.2" />)}
        {MAJOR.map((p) => <polyline key={p} points={p} strokeWidth="7" />)}
        <circle cx="150" cy="95" r="14" strokeWidth="7" />
      </g>
      <circle cx="150" cy="95" r="8" fill="var(--map-park)" />
    </>
  )
})

/* ---------- Markers: drawn outside the zoomed group, so they keep their size ---------- */
const TRUCK = 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'
const PIN = 'M0 0c0 0-8-8.7-8-14.3 0-4.3 3.6-7.7 8-7.7s8 3.4 8 7.7c0 5.6-8 14.3-8 14.3z'
const Marker = ({ at, children }: { at: Point; children: ReactNode }) => (
  <g className="rm-mk" style={{ transform: `translate(${at[0]}px, ${at[1]}px)` }}>
    {children}
  </g>
)
const Label = ({ x = 0, y = 3.5, anchor = 'start', children }: { x?: number; y?: number; anchor?: 'start' | 'end'; children: ReactNode }) => (
  <text className="rm-lab" x={x} y={y} textAnchor={anchor}>
    {children}
  </text>
)
const Checkpoint = ({ done }: { done: boolean }) => (
  <>
    <circle r="6.5" fill="var(--sonar-color-surface-card)" />
    <circle r="4" className="rm-cp" data-done={done || undefined} />
  </>
)
const Pin = ({ done }: { done: boolean }) => (
  <g transform="scale(1.1)">
    <path d={PIN} fill={done ? 'var(--sonar-color-accent)' : 'var(--map-pin)'} />
    {done ? (
      <path d="M-3.3 -14.4 -1.1 -12.2 3.5 -16.8" fill="none" stroke="var(--sonar-color-on-emphasis)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <circle cy="-14.2" r="2.6" fill="var(--sonar-color-surface-card)" />
    )}
  </g>
)
const Truck = ({ late }: { late: boolean }) => (
  <>
    {late && <circle className="rm-pulse" r="13" />}
    <circle r="14" fill="var(--sonar-color-surface-card)" />
    <circle r="11.6" fill={late ? 'var(--sonar-color-danger-solid)' : 'var(--sonar-color-accent)'} />
    <path d={TRUCK} fill="var(--sonar-color-on-emphasis)" transform="translate(-7.5 -7.5) scale(.625)" />
  </>
)

/* ---------- The legend of the block: the same symbols as the map ---------- */
const NowMark = ({ state }: { state: RouteState['state'] }) => (
  <svg className="rm-g" viewBox="0 0 10 10" aria-hidden="true">
    {state === 'done' ? (
      <>
        <circle cx="5" cy="5" r="5" fill="var(--sonar-color-accent)" />
        <path d="M2.8 5.2 4.4 6.8 7.3 3.6" fill="none" stroke="var(--sonar-color-on-emphasis)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : state === 'late' ? (
      <circle cx="5" cy="5" r="5" fill="var(--sonar-color-danger-solid)" />
    ) : (
      <circle cx="5" cy="5" r="3.6" fill="none" stroke="var(--sonar-color-border-control)" strokeWidth="1.6" />
    )}
  </svg>
)
const StopMark = ({ on }: { on: boolean }) => (
  <svg className="rm-g" viewBox="0 0 10 10" aria-hidden="true">
    {on ? <circle cx="5" cy="5" r="3.6" fill="var(--sonar-color-accent)" /> : <circle cx="5" cy="5" r="3.2" fill="none" stroke="var(--sonar-color-border-control)" strokeWidth="1.6" />}
  </svg>
)
const PinMark = ({ done }: { done: boolean }) => (
  <svg className="rm-g" viewBox="-6 -17 12 18" aria-hidden="true">
    <g transform="scale(.8)">
      <path d={PIN} fill={done ? 'var(--sonar-color-accent)' : 'var(--map-pin)'} />
    </g>
  </svg>
)

export default function RouteMap({ route, code }: { route: RouteState; code: string }) {
  const host = useRef<HTMLDivElement>(null)
  const gesture = useRef<{ x: number; y: number; v: View; moved: boolean } | null>(null)
  const [width, setWidth] = useState(BASE_W)
  const [v, setV] = useState<View>({ s: 1, x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  /* The map takes the panel’s whole width; the drawing stays centered in it */
  useLayoutEffect(() => {
    const element = host.current
    if (!element) return
    const observer = new ResizeObserver(() => setWidth(Math.round(element.clientWidth) || BASE_W))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const TX = 44 - 60 * K + (width - BASE_W) / 2
  const focus = { x: width / 2, y: 128 } // zoom centers on the free band between the controls and the block
  const C = ([x, y]: Point): Point => [TX + K * x, TY + K * y]
  const clamp = (next: { x: number; y: number }, s: number): View => ({
    s,
    x: Math.min(0, Math.max(width - width * s, next.x)),
    y: Math.min(0, Math.max(MAP_H - MAP_H * s, next.y)),
  })
  const zoomAt = (cur: View, s: number, f = focus) => {
    const k = s / cur.s
    return clamp({ x: f.x - (f.x - cur.x) * k, y: f.y - (f.y - cur.y) * k }, s)
  }

  const { state, km } = route
  const late = state === 'late'
  const done = state === 'done'
  const scheduled = state === 'sched'
  const traveled = done ? ROUTE.total : late ? ROUTE.LEN.late : 0
  const cut = traveled > 0 && traveled < ROUTE.total ? ROUTE.split(traveled) : null
  const doneLine = done ? ROUTE.pts : cut ? cut.done : null
  const restLine = cut ? cut.rest : scheduled ? ROUTE.pts : null
  const here: Point = late ? ROUTE.split(ROUTE.LEN.late).p : done ? ROUTE.pts[ROUTE.pts.length - 1]! : ROUTE.pts[0]!
  const S = (pt: Point): Point => {
    const [cx, cy] = C(pt)
    return [v.x + v.s * cx, v.y + v.s * cy]
  }
  const at = (len: number) => ROUTE.split(len).p
  const left = Math.max(0, km - Math.round((km * traveled) / ROUTE.total))
  const f9 = ROUTE.LEN.r9 / ROUTE.total
  const f12 = ROUTE.LEN.r12 / ROUTE.total
  const fp = traveled / ROUTE.total

  const toMap = (event: { clientX: number; clientY: number }) => {
    const box = host.current!.getBoundingClientRect()
    const k = width / box.width
    return { x: (event.clientX - box.left) * k, y: (event.clientY - box.top) * k }
  }
  const step = (direction: number, f?: { x: number; y: number }) =>
    setV((cur) => {
      const next = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, LEVELS.indexOf(cur.s) + direction))]!
      return next === cur.s ? cur : zoomAt(cur, next, f)
    })
  const [hx, hy] = C(here)
  const centered = v.s === 2 && Math.abs(v.x + 2 * hx - focus.x) < 6 && Math.abs(v.y + 2 * hy - focus.y) < 6
  const locate = () => setV(centered ? { s: 1, x: 0, y: 0 } : clamp({ x: focus.x - 2 * hx, y: focus.y - 2 * hy }, 2))

  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button > 0 || v.s === 1 || (event.target as Element).closest('.rm-tools, .rm-info')) return
    host.current!.setPointerCapture(event.pointerId)
    gesture.current = { x: event.clientX, y: event.clientY, v, moved: false }
  }
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current
    if (!g) return
    const k = width / host.current!.getBoundingClientRect().width
    const dx = (event.clientX - g.x) * k
    const dy = (event.clientY - g.y) * k
    if (!g.moved && Math.hypot(dx, dy) < 3) return
    g.moved = true
    setDragging(true)
    setV(clamp({ x: g.v.x + dx, y: g.v.y + dy }, g.v.s))
  }
  const up = () => {
    gesture.current = null
    setDragging(false)
  }
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== host.current || event.metaKey || event.ctrlKey || event.altKey) return
    const k = event.key
    const P = 48
    if (k === '+' || k === '=') step(1)
    else if (k === '-' || k === '_') step(-1)
    else if (k === '0') setV({ s: 1, x: 0, y: 0 })
    else if (k.startsWith('Arrow') && v.s > 1)
      setV((c) => clamp({ x: c.x + (k === 'ArrowLeft' ? P : k === 'ArrowRight' ? -P : 0), y: c.y + (k === 'ArrowUp' ? P : k === 'ArrowDown' ? -P : 0) }, c.s))
    else return
    event.preventDefault()
  }

  /* The scale bar grows and rounds to a nice length as the map zooms */
  const kmPerPx = km / (ROUTE.total * K) / v.s
  let nice = NICE[0]!
  for (const n of NICE) if (n / kmPerPx <= 92) nice = n
  const [ox, oy] = S(ROUTE.pts[0]!)
  const [r9x, r9y] = S(at(ROUTE.LEN.r9))
  const [r12x, r12y] = S(at(ROUTE.LEN.r12))
  const [dx, dy] = S(ROUTE.pts[ROUTE.pts.length - 1]!)
  const [tx, ty] = S(here)
  const tool = (label: string, icon: ReactNode, onClick: () => void, disabled = false) => (
    <button type="button" className="rm-btn" aria-label={label} aria-disabled={disabled || undefined} onClick={() => !disabled && onClick()}>
      {icon}
    </button>
  )

  return (
    <div
      className="rmap"
      data-pan={v.s > 1 || undefined}
      data-dragging={dragging || undefined}
      ref={host}
      tabIndex={0}
      role="group"
      aria-roledescription="map"
      aria-label={`Route map for ${code}. Plus and minus zoom, arrow keys pan.`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={key}
      onDoubleClick={(event) => {
        if (!(event.target as Element).closest('.rm-tools, .rm-info')) step(1, toMap(event))
      }}
    >
      <svg className="rm-svg" viewBox={`0 0 ${width} ${MAP_H}`} aria-hidden="true">
        <g className="rm-world" style={{ transform: `translate(${v.x}px, ${v.y}px) scale(${v.s})` }}>
          <g transform={`translate(${TX} ${TY}) scale(${K})`}>
            <Art />
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={line(ROUTE.pts)} stroke="var(--map-road)" strokeWidth="7" vectorEffect="non-scaling-stroke" />
              {restLine && <polyline points={line(restLine)} stroke="var(--sonar-color-border-strong)" strokeWidth="2.4" strokeDasharray="0.1 6" vectorEffect="non-scaling-stroke" />}
              {doneLine && <polyline points={line(doneLine)} stroke="var(--sonar-color-accent)" strokeWidth="3.6" vectorEffect="non-scaling-stroke" />}
            </g>
          </g>
        </g>
        <Marker at={[ox, oy]}>
          <Checkpoint done={!scheduled} />
          <Label x={11}>{route.origin}</Label>
        </Marker>
        <Marker at={[r9x, r9y]}>
          <Checkpoint done={traveled >= ROUTE.LEN.r9} />
          <Label x={-10} y={-8} anchor="end">
            Route 9
          </Label>
        </Marker>
        <Marker at={[r12x, r12y]}>
          <Checkpoint done={traveled >= ROUTE.LEN.r12} />
          <Label x={11}>Route 12</Label>
        </Marker>
        <Marker at={[dx, dy]}>
          <Pin done={done} />
          <Label x={-14} y={-10} anchor="end">
            {route.dest}
          </Label>
        </Marker>
        {!scheduled && !done && (
          <Marker at={[tx, ty]}>
            <Truck late={late} />
          </Marker>
        )}
      </svg>

      <div className="rm-compass" role="img" aria-label="North is up">
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <path d="M18 6.5 22.6 18H13.4Z" fill="var(--sonar-color-accent)" />
          <path d="M18 29.5 13.4 18H22.6Z" fill="var(--sonar-color-fill-muted)" />
          <circle cx="18" cy="18" r="1.6" fill="var(--sonar-color-surface-card)" />
        </svg>
      </div>
      <div className="rm-tools" role="toolbar" aria-label="Map controls">
        {tool('Zoom in', <AddIcon />, () => step(1), v.s === LEVELS[LEVELS.length - 1])}
        {tool('Zoom out', <MinusIcon />, () => step(-1), v.s === 1)}
        {tool(centered ? 'Show full route' : 'Center on vehicle', centered ? <ZoomOutMapIcon /> : <MyLocationIcon />, locate)}
      </div>
      <div className="rm-scale" aria-hidden="true">
        <span className="rm-bar" style={{ width: nice / kmPerPx }} />
        <span>{nice} km</span>
      </div>

      <div className="rm-info">
        <div className="rm-row">
          <div>
            <span className="rm-cl">
              <NowMark state={state} />
              Current location
            </span>
            <span className="rm-cv">{route.cur}</span>
          </div>
          <div>
            <span className="rm-cl">
              <StopMark on={route.last !== '—'} />
              Last stop
            </span>
            <span className="rm-cv">{route.last}</span>
          </div>
          <div>
            <span className="rm-cl">
              <PinMark done={done} />
              Destination
            </span>
            <span className="rm-cv">{route.dest}</span>
          </div>
        </div>
        <div className="rm-prog">
          <div className="rm-track" aria-hidden="true">
            <i className="rm-tl" data-part="rest" />
            <i className="rm-tl" data-part="done" style={{ width: `${fp * 100}%` }} />
            <i className="rm-td" data-on={!scheduled || undefined} style={{ left: 0 }} />
            <i className="rm-td" data-on={traveled >= ROUTE.LEN.r9 || undefined} style={{ left: `${f9 * 100}%` }} />
            <i className="rm-td" data-on={traveled >= ROUTE.LEN.r12 || undefined} style={{ left: `${f12 * 100}%` }} />
            {late && (
              <i className="rm-tt" style={{ left: `${fp * 100}%` }}>
                <ShippingIcon />
              </i>
            )}
            <i className="rm-te">
              <svg viewBox="-6 -17 12 18">
                <g transform="scale(.8)">
                  <path d={PIN} fill={done ? 'var(--sonar-color-accent)' : 'var(--map-pin)'} />
                </g>
              </svg>
            </i>
          </div>
          <span className="rm-km">
            {late ? (
              <>
                <b>{left} km</b> left · {route.eta}
              </>
            ) : (
              <>
                <b>{km} km</b> · {route.eta}
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
