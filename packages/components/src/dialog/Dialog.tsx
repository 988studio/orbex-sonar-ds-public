import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type ComponentProps, type MouseEvent, type PointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../internal/cx.ts'
import { CloseMark } from '../internal/icons.tsx'
import { useScrollArea } from '../internal/scroll-area.ts'
import { lockScroll } from '../internal/scroll-lock.ts'

export interface DialogProps extends Omit<ComponentProps<'dialog'>, 'open' | 'title' | 'onClose' | 'onCancel'> {
  /** Whether the dialog is shown. The dialog is always controlled. */
  open: boolean
  /** Called with `false` when the person closes it: the close button, Escape, a click outside, or a swipe down. */
  onOpenChange: (open: boolean) => void
  /** The heading, which also names the dialog for assistive technology. */
  title: ReactNode
  /** One paragraph under the title, read when the dialog opens. */
  description?: ReactNode
  /**
   * Center for a decision; end for a side panel, such as the details of a delivery; bottom for a sheet on phones.
   * On phones (under 600 px) a side panel becomes a sheet from the bottom, with a handle to swipe it down; tablets
   * and desktops keep it at the side.
   * @default 'center'
   */
  placement?: 'center' | 'end' | 'bottom'
  /**
   * Whether the rest of the page waits behind a scrim. A side panel that sits beside the overview, such as the
   * details of a delivery or a new order, is not modal: no scrim, the page stays in view and the row it came from
   * stays marked. It starts under the top bar (--sonar-dialog-top) and closes on Escape or a click outside.
   * @default true
   */
  modal?: boolean
  /** Buttons at the foot of the dialog, the main action last. */
  actions?: ReactNode
  /**
   * Name of the close button.
   * @default 'Close'
   */
  closeLabel?: string
  /**
   * Whether a click on the scrim, or outside a panel that is not modal, closes it. Turn it off when closing would
   * lose what the person typed.
   * @default true
   */
  dismissible?: boolean
}

/* Phones take side panels as sheets from the bottom; tablets, from 600 px, keep them at the side (1.0.0-alpha.18) */
const phone = () => typeof matchMedia === 'function' && matchMedia('(width < 600px)').matches

/* How the page was last used, and what was last pressed (1.0.0-alpha.21). Safari does not focus a button that is
   clicked or tapped, and it does focus a list that scrolls (it takes focus to scroll): the panel's way back was then
   the list, and returning to it drew the focus ring around the whole list, a glow left behind on close. A panel opened
   by a press goes back to what was pressed; closed by a press, focus goes back without its ring, which shows again
   at the next key. From the keyboard, focus and ring return as before */
let modality: 'pointer' | 'keyboard' = 'keyboard'
let pressed: { element: HTMLElement | null; at: number } = { element: null, at: 0 }
let watching = false
const watchModality = () => {
  if (watching || typeof document === 'undefined') return
  watching = true
  document.addEventListener(
    'pointerdown',
    (event) => {
      modality = 'pointer'
      const target = event.target instanceof Element ? event.target : null
      pressed = { element: target?.closest<HTMLElement>('button, a[href], [role="button"], input, select, textarea, summary') ?? null, at: Date.now() }
    },
    true,
  )
  document.addEventListener('keydown', () => (modality = 'keyboard'), true)
}
const QUIET = 'data-sonar-quiet-focus'
/* Focus back to `element`; after a press, without the ring until the next key */
const returnFocus = (element: HTMLElement | null) => {
  if (!element?.isConnected) return
  if (modality === 'keyboard') return element.focus({ preventScroll: true })
  element.setAttribute(QUIET, '')
  const clear = () => {
    element.removeAttribute(QUIET)
    element.removeEventListener('blur', clear)
    document.removeEventListener('keydown', clear, true)
  }
  element.addEventListener('blur', clear)
  document.addEventListener('keydown', clear, true)
  element.focus({ preventScroll: true, focusVisible: false } as FocusOptions)
}

/**
 * A dialog on the native `<dialog>` element. Modal, the browser moves focus in and back out, keeps it inside, makes
 * the rest of the page inert and closes on Escape. A side panel that is not modal leaves the page as it is: focus
 * moves into it and back to where it was, and Escape or a click outside closes it.
 */
/* Panels inside a DialogHost stay where they are written: an app drawn in a frame holds its own panels */
const Host = createContext(false)
let settled = false

/** Holds the side panels and sheets written inside it, as a drawn app frame does, instead of placing them against the window. */
export function DialogHost({ children }: { children: ReactNode }) {
  return <Host.Provider value={true}>{children}</Host.Provider>
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  placement = 'center',
  modal = true,
  actions,
  closeLabel = 'Close',
  dismissible = true,
  className,
  children,
  ...props
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  const titleId = `${id}-title`
  const descriptionId = description ? `${id}-description` : undefined
  /* Where focus goes back to when the panel has closed */
  const back = useRef<HTMLElement | null>(null)
  const close = useRef(onOpenChange)
  close.current = onOpenChange
  useEffect(watchModality, [])

  /* Where a side panel or sheet lives (1.0.0-alpha.23): against the window, as in the product, where the sheet rises
     from the bottom of the screen and the side panel runs the height of the window. A panel that stays where it is
     written is placed against the nearest ancestor that holds fixed elements (a transformed card, a scaled example, a
     container), so it opened from the card or the button and as tall as they were. It moves to the end of the page,
     keeping the theme it was written in, unless it is inside a DialogHost, as a drawn app frame is for its own panels.
     A panel on the page from the start moves once the page is live (closed, so nothing is seen); one that appears
     later is drawn there from its first frame. Modal dialogs already open above everything. */
  const hosted = useContext(Host)
  const floats = !modal && placement !== 'center' && !hosted
  const [live, setLive] = useState(settled)
  useEffect(() => {
    settled = true
    setLive(true)
  }, [])
  const layer = floats && live ? document.body : null
  const anchor = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const dialog = ref.current
    if (!layer || !dialog) return
    const themed = anchor.current?.parentElement?.closest('[data-theme]')
    const theme = themed && themed !== document.documentElement ? themed.getAttribute('data-theme') : null
    if (theme) dialog.setAttribute('data-theme', theme)
    else dialog.removeAttribute('data-theme')
  }, [layer])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      if (modal) dialog.showModal()
      else {
        const recent = modality === 'pointer' && pressed.element?.isConnected && Date.now() - pressed.at < 1500 && !dialog.contains(pressed.element)
        const opener = (recent ? pressed.element : document.activeElement) as HTMLElement | null
        dialog.show()
        dialog.focus({ preventScroll: true })
        /* Back to where it was, if focus is still in the panel when it closes */
        /* After the other effects have closed: on phones the page behind the sheet is inert until then, and focus
           given to an inert element is lost (1.0.0-alpha.24) */
        return () => {
          if (!dialog.contains(document.activeElement) && document.activeElement !== document.body) return
          back.current = opener
          queueMicrotask(() => {
            if (back.current === opener) returnFocus(opener)
          })
        }
      }
    }
    if (!open && dialog.open) {
      /* Leaving: Safari hides a dialog the moment it closes, before its exit can play, so the dialog takes its closed
         look while still open and closes once the exit has run (1.0.0-alpha.19) */
      dialog.setAttribute('data-leaving', '')
      const ms = Math.max(0, ...getComputedStyle(dialog).transitionDuration.split(',').map((d) => parseFloat(d) * (d.includes('ms') ? 1 : 1000)).filter((d) => d > 0))
      /* Closing a dialog, WebKit gives focus back to whatever held it when the dialog was shown. On a phone, Safari does
         not focus a tapped button but does focus a list that was scrolled: a panel opened from a row of a scrolling
         card gave focus back to the whole list, with its ring, a glow around the card once the sheet had gone
         (1.0.0-alpha.24). Focus goes where the panel sent it, and after a press still without its ring */
      const done = () => {
        dialog.removeAttribute('data-leaving')
        if (!dialog.open) return
        const before = document.activeElement
        dialog.close()
        const target = back.current
        back.current = null
        /* Unless the person had already moved focus somewhere else; then it stays there */
        const elsewhere = before instanceof HTMLElement && before !== document.body && before !== target && !dialog.contains(before)
        if (elsewhere) {
          if (document.activeElement !== before) before.focus({ preventScroll: true })
        } else if (target?.isConnected && document.activeElement !== target) returnFocus(target)
      }
      if (ms < 20) return done()
      const timer = setTimeout(done, ms)
      return () => {
        clearTimeout(timer)
        dialog.removeAttribute('data-leaving')
      }
    }
  }, [open, modal, layer])

  /* While it is open the page behind does not scroll, modal or not (on phones a side panel is a sheet over the page),
     and it is where it was when the dialog closes */
  useEffect(() => {
    const dialog = ref.current
    if (!open || !dialog) return
    return lockScroll(dialog)
  }, [open, layer])

  /* Not modal: Escape and a press outside close it, unless the press lands in another layer, such as a menu or a
     confirmation that belongs to it, or on what opens a panel (data-panel), which toggles it or shows another row in
     it, as in the product (1.0.0-alpha.18) */
  useEffect(() => {
    if (modal || !open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) close.current(false)
    }
    const onPress = (event: globalThis.PointerEvent) => {
      const target = event.target as Element | null
      const dialog = ref.current
      if (!dismissible || !dialog || !target || dialog.contains(target)) return
      if (target.closest('dialog[open], [role="menu"], [role="listbox"], [data-base-ui-inert], [data-panel], .sonar-toast-viewport')) return
      close.current(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPress, true)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPress, true)
    }
  }, [modal, open, dismissible, layer])

  /* Not modal, the panel still holds the keyboard: Tab and Shift+Tab go round inside it, so focus never lands on the
     page behind, which is out of reach under a sheet or locked beside a panel. On phones, where the panel is a sheet
     over the page, the rest of the page is also inert, as under a modal: a screen reader stays in the sheet, and a
     tap outside reaches the page's own background and closes it (1.0.0-alpha.20, accessibility audit #1) */
  useEffect(() => {
    const dialog = ref.current
    if (modal || !open || !dialog) return
    const onTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || event.defaultPrevented) return
      const active = document.activeElement
      if (!active || !dialog.contains(active)) return
      const stops = [...dialog.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]')].filter(
        (element) => element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[inert], [hidden]') && element.getClientRects().length > 0,
      )
      const first = stops[0]
      const last = stops[stops.length - 1]
      if (!first || !last) return event.preventDefault()
      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onTab)
    const quieted: HTMLElement[] = []
    if (phone()) {
      for (let node: HTMLElement = dialog; node.parentElement && node !== document.body; node = node.parentElement) {
        for (const sibling of node.parentElement.children) {
          if (sibling === node || !(sibling instanceof HTMLElement) || sibling.inert || sibling.matches('script, style, dialog[open]')) continue
          sibling.inert = true
          quieted.push(sibling)
        }
      }
    }
    return () => {
      document.removeEventListener('keydown', onTab)
      for (const element of quieted) element.inert = false
    }
  }, [modal, open, layer])

  /* Side panel and sheet: the body scrolls between header and actions and fades over the last 24 px when it has more
     below (22 px at the top when it has more above), as the card lists do; the fade ends on the actions' rule */
  const body = useRef<HTMLDivElement>(null)
  /* No scrollbar of the system over the panel's content: the product's thin indicator, 4 px from the panel's edge,
     while it scrolls (1.0.0-alpha.18) */
  const thumb = useRef<HTMLSpanElement>(null)
  useScrollArea(body, thumb, open && placement !== 'center')
  useEffect(() => {
    const element = body.current
    if (!open || !element || placement === 'center') return
    const place = () => {
      const { scrollTop: top, scrollHeight: content, clientHeight: height } = element
      element.toggleAttribute('data-more-above', top > 1)
      element.toggleAttribute('data-more-below', top < content - height - 1)
    }
    const sizes = new ResizeObserver(place)
    sizes.observe(element)
    for (const child of element.children) sizes.observe(child)
    element.addEventListener('scroll', place, { passive: true })
    place()
    return () => {
      sizes.disconnect()
      element.removeEventListener('scroll', place)
    }
  }, [open, placement])

  /* A click whose press started on the scrim: dragging a selection out of the dialog does not close it */
  const pressedOutside = useRef(false)
  const isOutside = (event: MouseEvent<HTMLDialogElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom
  }

  /* On phones a sheet follows the finger down from its handle or header, and goes when let go far or fast enough */
  const swipe = useRef<{ y: number; t: number; dy: number } | null>(null)
  const sheet = placement === 'bottom' || placement === 'end'
  const onSwipeStart = (event: PointerEvent<HTMLElement>) => {
    if (!sheet || !phone() || (event.target as Element).closest('button, a, input, select, textarea')) return
    swipe.current = { y: event.clientY, t: event.timeStamp, dy: 0 }
    event.currentTarget.setPointerCapture(event.pointerId)
    ref.current?.setAttribute('data-dragging', '')
  }
  const onSwipeMove = (event: PointerEvent<HTMLElement>) => {
    const current = swipe.current
    if (!current || !ref.current) return
    current.dy = Math.max(0, event.clientY - current.y)
    ref.current.style.translate = `0 ${current.dy}px`
  }
  const onSwipeEnd = (event: PointerEvent<HTMLElement>) => {
    const current = swipe.current
    const dialog = ref.current
    swipe.current = null
    if (!current || !dialog) return
    dialog.removeAttribute('data-dragging')
    const fast = current.dy / Math.max(1, event.timeStamp - current.t) > 0.5
    const away = event.type === 'pointerup' && (current.dy > 110 || (current.dy > 40 && fast))
    dialog.style.translate = ''
    if (away) close.current(false)
  }
  const swipeProps = sheet ? { onPointerDown: onSwipeStart, onPointerMove: onSwipeMove, onPointerUp: onSwipeEnd, onPointerCancel: onSwipeEnd } : {}

  const element = (
    <dialog
      ref={ref}
      className={cx('sonar-dialog', className)}
      data-placement={placement}
      data-modal={modal ? undefined : 'false'}
      tabIndex={modal ? undefined : -1}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault()
        onOpenChange(false)
      }}
      onClose={() => open && onOpenChange(false)}
      onMouseDown={(event) => (pressedOutside.current = dismissible && isOutside(event))}
      onClick={(event) => {
        if (pressedOutside.current && isOutside(event)) onOpenChange(false)
        pressedOutside.current = false
      }}
      {...props}
    >
      {sheet && <span className="sonar-dialog-handle" aria-hidden="true" {...swipeProps} />}
      <header className="sonar-dialog-header" {...swipeProps}>
        <h2 className="sonar-dialog-title" id={titleId}>
          {title}
        </h2>
        <button type="button" className="sonar-dialog-close" aria-label={closeLabel} onClick={() => onOpenChange(false)}>
          <CloseMark />
        </button>
      </header>
      {description && (
        <p className="sonar-dialog-description" id={descriptionId}>
          {description}
        </p>
      )}
      {children && (
        <div ref={body} className="sonar-dialog-body" data-labelledby={titleId}>
          {children}
        </div>
      )}
      {children && placement !== 'center' && <span ref={thumb} className="sonar-dialog-thumb" aria-hidden="true" hidden />}
      {actions && <footer className="sonar-dialog-actions">{actions}</footer>}
    </dialog>
  )
  if (!floats) return element
  return (
    <>
      {layer ? createPortal(element, layer) : element}
      <span ref={anchor} className="sonar-dialog-anchor" hidden />
    </>
  )
}
