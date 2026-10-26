import { useEffect, useId, useRef, useState } from 'react'
import { Menu } from '@orbex/sonar-components/menu'
import '@orbex/sonar-components/menu.css'
import './app-tokens.css'
import './customize.css'
import './unbuilt.css'

/* ---------------- Customize overview ---------------- */

export const MODULES: [string, string][] = [
  ['orders', 'Orders'], ['deliveries', 'Deliveries'], ['shipments', 'Daily shipments'], ['inventory', 'Inventory'], ['balance', 'Balance'],
  ['recurring', 'Recurring orders'], ['notifications', 'Notifications'], ['invoices', 'Invoices'], ['documents', 'Latest documents'], ['credits', 'Credit notes'], ['scheduled', 'Scheduled orders'],
]
export const BASIC_SET = ['orders', 'inventory', 'shipments']

/* The layouts made for a role. Only the name changes here: in the prototype a role does not rearrange the overview yet */
const ROLES = ['Delivery manager', 'Warehouse supervisor', 'Purchasing manager', 'Transport planner', 'Accounts payable']

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (on: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      data-state={checked ? 'checked' : 'unchecked'}
      className={'tg' + (checked ? ' on' : '')}
      onClick={() => onChange(!checked)}
    />
  )
}

export interface CustomizeProps {
  open: boolean
  onClose: () => void
  /** The modules on the overview now */
  shown: string[]
  setShown: (ids: string[], on: boolean) => void
  onSave: () => void
  onReset: () => void
  /** 1.1: bumped when a Reset to default is confirmed; the predefined layout menu goes back to its first role */
  resetSignal?: number
}

/**
 * Customize overview, as the product draws it: a sheet that hangs from the top bar over a scrim, not modal, so the top
 * bar stays usable. Switches show or hide modules; moving and resizing belong to Edit layout. Escape, ×, the scrim
 * or the sidebar link close it.
 */
export function Customize({ open, onClose, shown, setShown, onSave, onReset, resetSignal = 0 }: CustomizeProps) {
  const ref = useRef<HTMLElement>(null)
  const [role, setRole] = useState(ROLES[0]!)
  useEffect(() => {
    if (resetSignal) setRole(ROLES[0]!)
  }, [resetSignal])
  /* It stays in the page for its exit */
  const [mounted, setMounted] = useState(open)
  useEffect(() => {
    if (open) return setMounted(true)
    const timer = setTimeout(() => setMounted(false), 260)
    return () => clearTimeout(timer)
  }, [open])
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    requestAnimationFrame(() => ref.current?.focus({ preventScroll: true }))
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (ref.current?.contains(document.activeElement) || document.activeElement === document.body) opener?.focus?.({ preventScroll: true })
    }
  }, [open])
  if (!mounted) return null
  const isOn = (id: string) => shown.includes(id)
  const count = MODULES.filter(([id]) => isOn(id)).length
  const basic = BASIC_SET.every(isOn)
  const state = open ? 'open' : 'closed'
  const row = ([id, label]: [string, string]) => (
    <label key={id} className="tr">
      <span>{label}</span>
      <Switch checked={isOn(id)} onChange={(on) => setShown([id], on)} />
    </label>
  )
  return (
    <>
      <div className="scrim" data-state={state} aria-hidden="true" onClick={onClose} />
      <section ref={ref} className="sheet" data-state={state} role="dialog" aria-labelledby="cus-title" aria-describedby="cus-desc" tabIndex={-1}>
        <div className="sh-h">
          <div>
            <h2 id="cus-title" className="t18sb">
              Customize overview
            </h2>
            <p id="cus-desc" className="t12r grey" style={{ letterSpacing: 0, marginTop: 6 }}>
              Show or hide modules with the switches. To move or resize cards, use Edit layout.
            </p>
          </div>
          <button type="button" className="xbtn" aria-label="Close" onClick={onClose}>
            <span className="ms cv" aria-hidden="true">close</span>
          </button>
        </div>
        <div className="sh-g">
          <div className="sh-c">
            <div className="lb t12sb">BASIC SET</div>
            <p className="t12r grey">The essentials for daily tracking, switched on together.</p>
            <label className="tr set">
              <span>Orders + Inventory + Shipments</span>
              <Switch checked={basic} onChange={(on) => setShown(BASIC_SET, on)} />
            </label>
          </div>
          <div className="sh-c w2">
            <div className="lb t12sb">
              MODULES<span className="sep">|</span>
              <span className="green" style={{ fontWeight: 500 }}>
                {`${count} of ${MODULES.length} on`}
              </span>
            </div>
            <div className="cols2">
              <div>{MODULES.slice(0, 6).map(row)}</div>
              <div>{MODULES.slice(6).map(row)}</div>
            </div>
          </div>
          <div className="sh-c last">
            <div className="lb t12sb">PREDEFINED LAYOUTS</div>
            <p className="t12r grey">Start from a layout made for your role.</p>
            <Menu.Root>
              <Menu.Trigger className="field t12m" aria-label={`Predefined layout: ${role}`}>
                <span>{role}</span>
                <svg className="chev2" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M2 4.5 7 9.5 12 4.5" />
                </svg>
              </Menu.Trigger>
              <Menu.Content className="roles-menu" aria-label="Predefined layouts">
                <Menu.RadioGroup value={role} onValueChange={(next) => setRole(String(next))}>
                  {ROLES.map((name) => (
                    <Menu.RadioItem key={name} value={name}>
                      {name}
                    </Menu.RadioItem>
                  ))}
                </Menu.RadioGroup>
              </Menu.Content>
            </Menu.Root>
            <div className="sh-a">
              <button type="button" className="cta o" onClick={onSave}>
                Save layout<span className="ms" aria-hidden="true">save</span>
              </button>
              <a
                className="rst t12m"
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  onReset()
                }}
              >
                Reset to default
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

/* ---------------- Unbuilt module (404) ---------------- */

export interface UnbuiltProps {
  /** The section’s name, as the sidebar says it */
  label: string
  onHome: () => void
  onTry: (label: string) => void
}

/**
 * What the product shows for a sidebar section that has no screen yet: what happened, what does work, and the way back.
 * The prototype’s own 404, kept as the pattern for any module not built yet.
 */
export function Unbuilt({ label, onHome, onTry }: UnbuiltProps) {
  /* Each frame on a page draws its own page, so the title's id is its own */
  const titleId = useId()
  const nav: [string, string][] = [['New order', 'post_add'], ['Release stock', 'outbox'], ['Customize overview', 'tune']]
  const other: [string, string][] = [['Edit layout', 'dashboard_customize'], ['Notifications', 'notifications'], ['AI assistant chat', 'chat'], ['Light / dark mode', 'contrast'], ['Collapse sidebar', 'keyboard_double_arrow_left']]
  return (
    <div className="stage notice" role="region" aria-labelledby={titleId}>
      <section className="nt-card">
        <span className="nt-code t12m">404 · Prototype</span>
        <h3 id={titleId} className="nt-h">
          {`${label} isn’t part of this prototype`}
        </h3>
        <p className="nt-p">Orbex is a design prototype, so only part of the navigation is wired up. This section has no screen yet — the Overview is where the interactions live.</p>
        <h4 className="nt-s t12m">Sidebar options that work</h4>
        <div className="nt-chips">
          <button type="button" className="nt-chip" onClick={onHome}>
            <span className="ms f" aria-hidden="true">home</span>Overview
          </button>
          {nav.map(([text, icon]) => (
            <button type="button" key={text} className="nt-chip" onClick={() => onTry(text)}>
              <span className="ms" aria-hidden="true">{icon}</span>
              {text}
            </button>
          ))}
        </div>
        <h4 className="nt-s t12m">Also working</h4>
        <ul className="nt-list">
          {other.map(([text, icon]) => (
            <li key={text}>
              <span className="ms" aria-hidden="true">{icon}</span>
              {text}
            </li>
          ))}
        </ul>
        <button type="button" className="cta nt-cta" onClick={onHome}>
          Back to Overview
        </button>
      </section>
    </div>
  )
}
