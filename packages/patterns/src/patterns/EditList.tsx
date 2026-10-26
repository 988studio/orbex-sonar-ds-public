import { Button } from '@orbex/sonar-components/button'
import { Dialog } from '@orbex/sonar-components/dialog'
import { Switch } from '@orbex/sonar-components/switch'
import { ToastProvider, useToast } from '@orbex/sonar-components/toast'
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { DragIcon } from '../icons.tsx'

/*
 * Edit layout on a phone: the overview becomes a list. Each row is one line: a grip to drag it, the card’s name, its
 * sizes and a switch to show or hide it. Hidden cards wait in a list of their own. Reset to default, Cancel and Save
 * layout stay at the foot.
 */

type Size = 'S' | 'M' | 'L' | 'XL'
export interface Entry {
  id: string
  title: string
  size: Size
  sizes: Size[]
  hidden?: boolean
}

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

const HEIGHTS: Record<Size, number> = { S: 245, M: 375, L: 405, XL: 535 }

/* The default overview in reading order, then the cards that can be added */
const DEFAULT: Entry[] = [
  { id: 'orders', title: 'Orders', size: 'M', sizes: ['S', 'M'] },
  { id: 'shipments', title: 'Daily shipments', size: 'XL', sizes: ['L', 'XL'] },
  { id: 'balance', title: 'Balance', size: 'M', sizes: ['S', 'M', 'L'] },
  { id: 'deliveries', title: 'Deliveries', size: 'L', sizes: ['M', 'L', 'XL'] },
  { id: 'recurring', title: 'Recurring orders', size: 'L', sizes: ['M', 'L', 'XL'] },
  { id: 'inventory', title: 'Inventory', size: 'S', sizes: ['S', 'M'] },
  { id: 'notifications', title: 'Notifications', size: 'L', sizes: ['L'], hidden: true },
  { id: 'invoices', title: 'Invoices', size: 'L', sizes: ['L'], hidden: true },
  { id: 'documents', title: 'Latest documents', size: 'L', sizes: ['L'], hidden: true },
  { id: 'credits', title: 'Credit notes', size: 'L', sizes: ['L'], hidden: true },
  { id: 'scheduled', title: 'Scheduled orders', size: 'L', sizes: ['L'], hidden: true },
]

export interface EditListProps {
  /** The list to edit (the app shell's phone passes its overview); the default overview otherwise */
  initial?: Entry[]
  /** Inside the app shell's phone: Save layout and Cancel hand the list back (null: canceled) instead of staying here */
  onDone?: (list: Entry[] | null) => void
  /** The scale the phone frame is drawn at; a finger's moves are divided by it */
  zoom?: number
}

function Editor({ initial = DEFAULT, onDone, zoom = 1 }: EditListProps) {
  const toast = useToast()
  const [saved, setSaved] = useState(initial)
  const [list, setList] = useState(initial)
  /* A drag: the row follows the finger by y; the rows between its place and to slide by its height to make room */
  const [drag, setDrag] = useState<{ id: string; from: number; to: number; y: number; height: number } | null>(null)
  const [settle, setSettle] = useState<{ id: string; y: number } | null>(null)
  const [picked, setPicked] = useState<{ id: string; before: Entry[] } | null>(null)
  const [ask, setAsk] = useState<'reset' | 'discard' | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const gesture = useRef<{ id: string; pointer: number; startY: number; from: number; centers: number[]; height: number; to: number; y: number; stop: () => void } | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const shown = list.filter((entry) => !entry.hidden)
  const hidden = list.filter((entry) => entry.hidden)
  const dirty = JSON.stringify(list) !== JSON.stringify(saved)

  const setSize = (id: string, size: Size) => setList((current) => current.map((entry) => (entry.id === id ? { ...entry, size } : entry)))

  /* Showing a card puts it at the end of the shown ones; hiding it leaves it where it was */
  const toggle = (id: string, on: boolean) =>
    setList((current) => {
      const next = current.map((entry) => ({ ...entry }))
      const index = next.findIndex((entry) => entry.id === id)
      const [entry] = next.splice(index, 1)
      entry!.hidden = !on
      if (on) next.splice(next.reduce((last, other, at) => (other.hidden ? last : at), -1) + 1, 0, entry!)
      else next.splice(index, 0, entry!)
      return next
    })

  const moveTo = (id: string, place: number) =>
    setList((current) => {
      const visible = current.filter((entry) => !entry.hidden && entry.id !== id)
      visible.splice(Math.max(0, Math.min(place, visible.length)), 0, current.find((entry) => entry.id === id)!)
      return [...visible, ...current.filter((entry) => entry.hidden)]
    })

  /*
   * Pointer, with a finger or a mouse: the row lifts and follows; the others slide out of its way. The order only
   * changes when the row is let go, so nothing in the list moves under the finger while it holds the row. The gesture
   * ends however the browser ends it (up, cancel, lost capture, touchend) and always clears.
   */
  const end = (commit: boolean) => {
    const current = gesture.current
    if (!current) return
    gesture.current = null
    current.stop()
    const entry = list.find((other) => other.id === current.id)!
    if (commit && current.to !== current.from) {
      /* The row lands in its new place from where the finger left it */
      const offset = (current.to - current.from) * current.height
      moveTo(current.id, current.to)
      setSettle({ id: current.id, y: current.y - offset })
      setAnnouncement(`${entry.title} dropped at position ${current.to + 1} of ${shown.length}.`)
    } else {
      setSettle(current.y ? { id: current.id, y: current.y } : null)
      if (commit) setAnnouncement(`${entry.title} dropped at position ${current.from + 1} of ${shown.length}.`)
    }
    setDrag(null)
  }
  const onDown = (id: string) => (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || gesture.current) return
    event.preventDefault()
    const handle = event.currentTarget
    handle.setPointerCapture?.(event.pointerId)
    const rows = [...(listRef.current?.querySelectorAll<HTMLElement>(':scope > .edit-list-row') ?? [])]
    const from = rows.findIndex((row) => row.dataset.rowId === id)
    const boxes = rows.map((row) => row.getBoundingClientRect())
    const height = boxes[from]?.height ?? 56
    const pointer = event.pointerId
    const move = (next: globalThis.PointerEvent) => {
      const current = gesture.current
      if (!current || next.pointerId !== current.pointer) return
      next.preventDefault()
      const y = next.clientY - current.startY
      const center = current.centers[current.from]! + y
      /* Its place: after every other row whose middle it has passed */
      const to = current.centers.reduce((place, other, index) => (index === current.from ? place : center > other ? place + 1 : place), 0)
      current.y = y
      current.to = to
      setDrag({ id, from: current.from, to, y, height: current.height })
    }
    const up = (next: globalThis.PointerEvent) => next.pointerId === pointer && end(next.type === 'pointerup')
    const lost = () => end(true)
    const touchEnd = (next: TouchEvent) => next.touches.length === 0 && end(true)
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    window.addEventListener('touchend', touchEnd)
    window.addEventListener('touchcancel', touchEnd)
    handle.addEventListener('lostpointercapture', lost)
    gesture.current = {
      id,
      pointer,
      startY: event.clientY,
      from,
      centers: boxes.map((box) => box.top + box.height / 2),
      height,
      to: from,
      y: 0,
      stop: () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', up)
        window.removeEventListener('touchend', touchEnd)
        window.removeEventListener('touchcancel', touchEnd)
        handle.removeEventListener('lostpointercapture', lost)
        if (handle.hasPointerCapture?.(pointer)) handle.releasePointerCapture(pointer)
      },
    }
    setSettle(null)
    setDrag({ id, from, to: from, y: 0, height })
  }
  /* A gesture still open when the list goes away is closed with it */
  useEffect(() => () => gesture.current?.stop(), [])
  /* A document-wide touchmove listener, in place before a finger lands, refuses the page's scroll while a row is held:
     iOS only lets a move be cancelled when such a listener exists as the touch starts (1.0.0-alpha.21, as EditCards) */
  useEffect(() => {
    const hold = (event: TouchEvent) => {
      if (gesture.current && event.cancelable) event.preventDefault()
    }
    document.addEventListener('touchmove', hold, { passive: false })
    return () => document.removeEventListener('touchmove', hold)
  }, [])
  /* Let go: the row glides from under the finger into its slot, then drops its lift */
  useLayoutEffect(() => {
    if (!settle) return
    const row = listRef.current?.querySelector<HTMLElement>(`[data-row-id="${settle.id}"]`)
    if (!row || !settle.y || reducedMotion()) {
      setSettle(null)
      return
    }
    const glide = row.animate([{ translate: `0 ${settle.y / zoom}px` }, { translate: '0 0' }], { duration: 220, easing: 'cubic-bezier(0.2, 0, 0, 1)' })
    glide.onfinish = glide.oncancel = () => setSettle((current) => (current?.id === settle.id ? null : current))
    return () => glide.cancel()
  }, [settle])

  /* Keyboard: Space picks the row up and drops it, the arrow keys move it, Escape puts it back */
  const onKey = (entry: Entry, index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (picked?.id === entry.id) {
        setPicked(null)
        setAnnouncement(`${entry.title} dropped at position ${index + 1} of ${shown.length}.`)
      } else {
        setPicked({ id: entry.id, before: list })
        setAnnouncement(`Picked up ${entry.title}. Use the arrow keys to move it, Space to drop it, Escape to cancel.`)
      }
      return
    }
    if (picked?.id !== entry.id) return
    const by = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0
    if (by) {
      event.preventDefault()
      const place = Math.max(0, Math.min(index + by, shown.length - 1))
      moveTo(entry.id, place)
      setAnnouncement(`${entry.title} moved to position ${place + 1} of ${shown.length}.`)
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-row-id="${entry.id}"] .edit-list-grip`)?.focus())
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setList(picked.before)
      setPicked(null)
      setAnnouncement(`Moving ${entry.title} canceled.`)
    }
  }

  const save = () => {
    if (onDone) return onDone(list)
    const previous = saved
    setSaved(list)
    toast({ message: 'Layout saved', action: { label: 'Undo', onClick: () => (setSaved(previous), setList(previous)) } })
  }

  /* While a row is dragged: the row under the finger, and the rows between its place and its target slide by its height */
  const shift = (entry: Entry, index: number) => {
    if (!drag || entry.hidden) return undefined
    if (entry.id === drag.id) return { translate: `0 ${drag.y / zoom}px`, transition: 'none' }
    if (index > drag.from && index <= drag.to) return { translate: `0 ${-drag.height / zoom}px` }
    if (index < drag.from && index >= drag.to) return { translate: `0 ${drag.height / zoom}px` }
    return undefined
  }
  const row = (entry: Entry, index: number) => {
    const on = !entry.hidden
    const lifted = drag?.id === entry.id || settle?.id === entry.id
    return (
      <li
        key={entry.id}
        className="edit-list-row"
        data-row-id={entry.id}
        data-off={on ? undefined : ''}
        data-lifted={lifted || picked?.id === entry.id || undefined}
        style={shift(entry, index)}
      >
        {on ? (
          <button
            type="button"
            className="edit-list-grip"
            aria-label={`Move ${entry.title}`}
            aria-pressed={picked?.id === entry.id}
            onPointerDown={onDown(entry.id)}
            onKeyDown={onKey(entry, index)}
          >
            <DragIcon />
          </button>
        ) : (
          <span className="edit-list-grip" aria-hidden="true" />
        )}
        <span className="edit-list-name">{entry.title}</span>
        {on && entry.sizes.length > 1 && (
          <span className="edit-list-sizes" role="group" aria-label={`Size of ${entry.title}`}>
            {entry.sizes.map((size) => (
              <button key={size} type="button" aria-pressed={entry.size === size} title={`${HEIGHTS[size]} px`} onClick={() => setSize(entry.id, size)}>
                {size}
              </button>
            ))}
          </span>
        )}
        <Switch label={<span className="visually-hidden">{`Show ${entry.title}`}</span>} checked={on} onChange={(event) => toggle(entry.id, event.currentTarget.checked)} />
      </li>
    )
  }

  return (
    <div className="edit-list">
      <div className="edit-list-head">
        <h3>Edit layout</h3>
        <p>Drag to reorder. Switch modules on or off and pick their size.</p>
      </div>
      <h4 className="edit-list-label">
        On your overview<span aria-hidden="true">|</span>
        <span className="edit-list-count">{shown.length}</span>
      </h4>
      <ul ref={listRef} className="edit-list-rows" role="list" data-dragging={drag ? '' : undefined} data-settling={settle && !drag ? '' : undefined}>
        {shown.map(row)}
      </ul>
      {hidden.length > 0 && (
        <>
          <h4 className="edit-list-label">Hidden</h4>
          <ul className="edit-list-rows" role="list">
            {hidden.map(row)}
          </ul>
        </>
      )}
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      <div className="edit-list-bar">
        <button type="button" className="edit-reset" onClick={() => setAsk('reset')}>
          Reset to default
        </button>
        <Button size="small" variant="outlined" className="edit-cancel" onClick={() => (dirty ? setAsk('discard') : onDone ? onDone(null) : setList(saved))}>
          Cancel
        </Button>
        <Button size="small" disabled={!dirty} onClick={save}>
          Save layout
        </Button>
      </div>
      <Dialog
        open={ask !== null}
        onOpenChange={(open) => !open && setAsk(null)}
        title={ask === 'reset' ? 'Reset to default layout?' : 'Discard changes?'}
        description={ask === 'reset' ? 'All cards go back to their original position and size. Changes you have not saved will be lost.' : 'The changes you made to the layout will be lost.'}
        actions={
          <>
            <Button variant="text" onClick={() => setAsk(null)}>
              {ask === 'reset' ? 'Cancel' : 'Keep editing'}
            </Button>
            <Button
              onClick={() => {
                if (ask !== 'reset' && onDone) onDone(null)
                else setList(ask === 'reset' ? DEFAULT : saved)
                setAsk(null)
              }}
            >
              {ask === 'reset' ? 'Reset' : 'Discard'}
            </Button>
          </>
        }
      />
    </div>
  )
}

/** Edit layout inside the app shell's phone frame */
export function EditListPanel(props: EditListProps) {
  return (
    <ToastProvider>
      <Editor {...props} />
    </ToastProvider>
  )
}

/** The phone's default overview, in reading order, then the cards that can be added */
export const LIST_DEFAULT = DEFAULT

export default function EditList() {
  return (
    <ToastProvider>
      <Editor />
    </ToastProvider>
  )
}
