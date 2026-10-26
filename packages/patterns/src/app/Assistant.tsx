import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import './app-tokens.css'
import './assistant.css'

/**
 * The AI assistant, as the product draws it (Orbex · Prototype v38, Chat.jsx), with its own sample conversation.
 * Desktops and tablets: a floating window that moves by its header (or the arrow keys on it), toggles between
 * 340 × 460 and 520 × 680, and closes with × or Escape. On the desktop, with a mouse, it also resizes from any edge
 * or corner between 300 × 380 and 640 × 820; tablets, and any screen used by touch, keep only the toggle (1.0.0-alpha.21).
 * Phones: a bottom sheet with a handle, full height under the top bar, the input above the keyboard.
 */
type Box = { x: number; y: number; w: number; h: number }
type Card = { title: string; tag?: string; rows: [string, string][]; action: string }
type Message = { who: 'me' | 'them'; t: string; text: string; card?: Card }

const MIN = { w: 300, h: 380 }
const MAX = { w: 640, h: 820 }
const COMPACT = { w: 340, h: 460 }
const LARGE = { w: 520, h: 680 }
const EDGES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const now = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

const START: Message[] = [
  { who: 'them', t: '11:02', text: 'Good morning, Alex. I am the Orbex assistant. I can check deliveries, stock, payments and orders for you.' },
  {
    who: 'them',
    t: '11:02',
    text: 'Heads-up: delivery 04-127C is delayed after a truck breakdown on route 12.',
    card: { title: 'Delivery 04-127C', tag: 'Delayed', rows: [['Current location', 'Route 12, km 48'], ['New ETA', 'Today, 15:30'], ['Destination', 'Central DC · dock 4']], action: 'Open delivery' },
  },
  { who: 'me', t: '11:05', text: 'Will it still arrive today?' },
  { who: 'them', t: '11:05', text: 'Yes. A replacement truck picked up the load at 11:40 and the new ETA is 15:30, about 4 hours later than planned. Dock 4 at Central DC is still booked for you.' },
]
const SUGGEST = ['What is on hold in inventory?', 'Any payments due today?', 'Reorder stretch film']
const ANSWERS: [RegExp, Omit<Message, 'who' | 't'>][] = [
  [/hold|stock|inventor/i, { text: '840 plt are on hold right now, 30% of your 2,800 plt. Most of it is waiting for a quality check at North Hub.', card: { title: 'Inventory', rows: [['On hold', '840 plt'], ['Available', '1,960 plt'], ['Reserved for June', '420 plt']], action: 'Release stock' } }],
  [/pay|due|balance|invoice/i, { text: 'You have 46,800.00 USD due today, 1.2% of your balance. There is also 2,230,800.00 USD overdue.', card: { title: 'Due today', rows: [['Amount', '46,800.00 USD'], ['Invoices', '3'], ['Overdue', '2,230,800.00 USD']], action: 'Open payment calendar' } }],
  [/reorder|film|order/i, { text: 'Stretch film 23 µm (SF-2300) is out of stock until May 24. I can reorder the 20 µm version (SF-2000) instead: 410 plt available, same price per roll.', card: { title: 'Suggested reorder', rows: [['Product', 'Stretch film 20 µm'], ['Reference', 'SF-2000'], ['Quantity', '40 plt']], action: 'Review and reorder' } }],
  [/127c|delay|late|eta|truck/i, { text: 'No changes since 11:40. Delivery 04-127C is on the replacement truck and on track for 15:30.' }],
  [/thank|great|perfect|ok/i, { text: 'You are welcome. I will let you know if anything changes.' }],
]
const answer = (q: string) => (ANSWERS.find(([re]) => re.test(q)) ?? [null, { text: 'I can help with deliveries, stock, payments and orders. Try asking about one of them, for example “Where is 04-130A?”.' }])[1]

/** The Orbex sun, the assistant’s mark */
function Spark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2
        const r1 = i % 2 ? 4.5 : 3
        return <line key={i} x1={12 + Math.cos(a) * r1} y1={12 + Math.sin(a) * r1} x2={12 + Math.cos(a) * 10} y2={12 + Math.sin(a) * 10} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      })}
    </svg>
  )
}

export interface AssistantProps {
  /** The area the window moves in: the overview below the top bar */
  frame: { w: number; h: number }
  open: boolean
  onClose: () => void
  /** The scale the frame is drawn at, so a drag follows the pointer */
  k?: number
  /**
   * Whether the edges and corners resize it, as on the desktop in v38. Tablets and phones keep only the button that
   * toggles its two sizes; a corner is no target for a finger (1.0.0-alpha.21)
   */
  resizable?: boolean
}

export function Assistant({ frame, open, onClose, k = 1, resizable = true }: AssistantProps) {
  const [box, setBox] = useState<Box>({ x: frame.w - COMPACT.w - 32, y: frame.h - COMPACT.h - 66, ...COMPACT })
  const [messages, setMessages] = useState<Message[]>(START)
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const drag = useRef<{ mode: string; x: number; y: number; b: Box } | null>(null)
  const list = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  /* It stays on screen for the 150 ms of its exit */
  const [shown, setShown] = useState(open)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    if (open) {
      setShown(true)
      setLeaving(false)
      return
    }
    if (!shown) return
    setLeaving(true)
    const timer = setTimeout(() => {
      setShown(false)
      setLeaving(false)
    }, 150)
    return () => clearTimeout(timer)
  }, [open])
  /* Opened by the person: focus goes to the input. Open when the page loads: focus stays where it is */
  const opened = useRef(false)
  useLayoutEffect(() => {
    if (shown && open) {
      if (list.current) list.current.scrollTop = list.current.scrollHeight
      /* 1.1 (pending #21): on touch screens the field is not focused on open. On the iPhone that focus (or the keyboard
         it can raise) left the conversation not scrolling until something was typed; the person taps the field to
         write. Mouse and keyboard keep v38's focus on open. */
      if (opened.current && !matchMedia('(pointer: coarse)').matches) input.current?.focus({ preventScroll: true })
    }
    opened.current = true
  }, [shown, open])
  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight
  }, [messages, typing])
  /* The conversation starts at its latest line and scrolls from the first moment (1.0.0-alpha.23): when the list gets
     its size late (the example loads as it comes into view, the frame is scaled to fit), it goes to the latest line
     then, unless the person has already scrolled it */
  useEffect(() => {
    const element = list.current
    if (!element || !shown) return
    let touched = false
    const onScroll = () => {
      if (element.scrollTop < element.scrollHeight - element.clientHeight - 2) touched = true
    }
    const sizes = new ResizeObserver(() => {
      if (!touched) element.scrollTop = element.scrollHeight
    })
    sizes.observe(element)
    element.addEventListener('wheel', () => (touched = true), { passive: true, once: true })
    element.addEventListener('touchstart', () => (touched = true), { passive: true, once: true })
    element.addEventListener('scroll', onScroll, { passive: true })
    /* 1.1 (pending #21, #23): the phone sheet rises with a transform animation; iOS can build the list's touch
       scrolling during it and leave it inert until the list lays out again (typing a message did that). When the sheet
       has risen, the list's overflow is set again so a finger scrolls it at once. */
    const sheet = element.closest<HTMLElement>('.chatw')
    const rearm = (event?: AnimationEvent) => {
      if (event && event.target !== sheet) return
      const keep = element.scrollTop
      element.style.overflowY = 'hidden'
      void element.offsetHeight
      element.style.overflowY = ''
      element.scrollTop = keep
    }
    sheet?.addEventListener('animationend', rearm)
    const late = setTimeout(rearm, 480)
    return () => {
      sizes.disconnect()
      element.removeEventListener('scroll', onScroll)
      sheet?.removeEventListener('animationend', rearm)
      clearTimeout(late)
    }
  }, [shown])
  useEffect(() => {
    if (!open) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const start = (mode: string) => (event: PointerEvent<HTMLElement>) => {
    if (mode === 'move' && (event.target as Element).closest('button')) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { mode, x: event.clientX, y: event.clientY, b: { ...box } }
  }
  const move = (event: PointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d) return
    const dx = (event.clientX - d.x) / k
    const dy = (event.clientY - d.y) / k
    const b = d.b
    if (d.mode === 'move') return setBox({ ...b, x: clamp(b.x + dx, 0, frame.w - b.w), y: clamp(b.y + dy, 0, frame.h - b.h) })
    /* The side opposite the one dragged stays put */
    const n = { ...b }
    if (d.mode.includes('e')) n.w = clamp(b.w + dx, MIN.w, Math.min(MAX.w, frame.w - b.x))
    if (d.mode.includes('w')) {
      const right = b.x + b.w
      n.w = clamp(b.w - dx, MIN.w, Math.min(MAX.w, right))
      n.x = right - n.w
    }
    if (d.mode.includes('s')) n.h = clamp(b.h + dy, MIN.h, Math.min(MAX.h, frame.h - b.y))
    if (d.mode.includes('n')) {
      const bottom = b.y + b.h
      n.h = clamp(b.h - dy, MIN.h, Math.min(MAX.h, bottom))
      n.y = bottom - n.h
    }
    setBox(n)
  }
  const end = () => {
    drag.current = null
  }
  /* The arrow keys move the window from its header; Shift moves it further */
  const keyMove = (event: KeyboardEvent<HTMLElement>) => {
    const step = event.shiftKey ? 40 : 10
    const delta = ({ ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] } as Record<string, [number, number]>)[event.key]
    if (!delta) return
    event.preventDefault()
    setBox((b) => ({ ...b, x: clamp(b.x + delta[0], 0, frame.w - b.w), y: clamp(b.y + delta[1], 0, frame.h - b.h) }))
  }
  const big = box.w >= LARGE.w - 1 && box.h >= LARGE.h - 1
  const toggleSize = () =>
    setBox((b) => {
      const s = big ? COMPACT : LARGE
      return { ...b, ...s, x: clamp(b.x + b.w - s.w, 0, frame.w - s.w), y: clamp(b.y + b.h - s.h, 0, frame.h - s.h) }
    })

  const send = (question = draft) => {
    const text = question.trim()
    if (!text || typing) return
    setMessages((m) => [...m, { who: 'me', t: now(), text }])
    setDraft('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((m) => [...m, { who: 'them', t: now(), ...answer(text) }])
    }, 1600)
  }

  if (!shown) return null
  return (
    <section
      className={'chatw' + (leaving ? ' leaving' : '')}
      aria-hidden={leaving || undefined}
      role="dialog"
      aria-label="Chat with the Orbex AI assistant"
      style={{ left: box.x, top: box.y, width: box.w, height: box.h } as CSSProperties}
    >
      <div className="cw-h" onPointerDown={start('move')} onPointerMove={move} onPointerUp={end} onPointerCancel={end} tabIndex={0} onKeyDown={keyMove} aria-label="Chat window. Drag or use the arrow keys to move it.">
        <span className="cw-av" aria-hidden="true">
          <Spark />
        </span>
        <div className="cw-t">
          <div className="t14sb">
            Orbex assistant<span className="cw-ai t11m">AI</span>
          </div>
          <div className="t12r grey">
            <i className="cw-on" />
            Deliveries, stock and payments
          </div>
        </div>
        <button type="button" className="cw-b" onClick={toggleSize} aria-label={big ? 'Make the chat smaller' : 'Make the chat larger'}>
          <span className="ms" aria-hidden="true">{big ? 'close_fullscreen' : 'open_in_full'}</span>
        </button>
        <button type="button" className="cw-b" onClick={onClose} aria-label="Close chat">
          <span className="ms" aria-hidden="true">close</span>
        </button>
      </div>
      <div className="cw-list" ref={list} aria-live="polite">
        <div className="cw-day t12r grey">Today</div>
        {messages.map((m, i) => (
          <div key={i} className={'cw-m ' + m.who}>
            <div className="cw-bub t12r">{m.text}</div>
            {m.card && (
              <div className="cw-card">
                <div className="cw-ch">
                  <span className="t12m">{m.card.title}</span>
                  {m.card.tag && <span className="cw-tag t11m">{m.card.tag}</span>}
                </div>
                {m.card.rows.map(([label, value]) => (
                  <div key={label} className="cw-row t12r">
                    <span className="grey">{label}</span>
                    <b>{value}</b>
                  </div>
                ))}
                <button type="button" className="cw-act t12m">
                  {m.card.action}
                  <span className="ms" aria-hidden="true">arrow_forward</span>
                </button>
              </div>
            )}
            <div className="cw-time t12r grey">
              {`${m.who === 'them' ? 'Assistant · ' : ''}${m.t}`}
            </div>
          </div>
        ))}
        {typing && (
          <div className="cw-m them">
            <div className="cw-bub typing" role="img" aria-label="The assistant is thinking">
              <i />
              <i />
              <i />
            </div>
          </div>
        )}
      </div>
      <div className="cw-sug" role="group" aria-label="Suggested questions">
        {SUGGEST.map((q) => (
          <button type="button" key={q} className="t12r" onClick={() => send(q)} disabled={typing}>
            {q}
          </button>
        ))}
      </div>
      <div className="cw-in">
        <textarea
          ref={input}
          rows={1}
          className="t12r"
          placeholder="Ask the assistant…"
          value={draft}
          aria-label="Message"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />
        <button type="button" className="cw-send" onClick={() => send()} disabled={!draft.trim()} aria-label="Send message">
          <span className="ms" aria-hidden="true">arrow_upward</span>
        </button>
      </div>
      <div className="cw-note t12r grey">AI answers can be wrong. Check important details.</div>
      {resizable && EDGES.map((edge) => (
        <span key={edge} className={'cw-rs ' + edge} onPointerDown={start(edge)} onPointerMove={move} onPointerUp={end} onPointerCancel={end} aria-hidden="true" />
      ))}
    </section>
  )
}
