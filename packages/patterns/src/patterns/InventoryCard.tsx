import { Card, UnitMenu } from '@orbex/sonar-components/card'
import { RingChart } from '@orbex/sonar-components/ring-chart'
import { createContext, useContext, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { inUnit, inventory, quantity, units, withUnit, type Unit } from './data.ts'
import { Count } from './motion.ts'
import './cards.css'

/**
 * Whether Release stock was used in the app demo around the card (1.0.0-alpha.21). As in v38 (modules.js, state C), half
 * of what is on hold is released: 840 → 420 plt on hold, 1,960 → 2,380 available; the ring and the figures move to it.
 */
export const StockReleased = createContext(false)
const RELEASED = { onHold: 420, available: 2380 }

/**
 * Inventory, in S or M: the ring centered between its two figures, on hold on the left where its part of the ring
 * starts, in red, and available on the right, in gray; the names at the foot. M draws the ring larger.
 */
export default function InventoryCard({ size = 's', label }: { size?: 's' | 'm'; label?: string }) {
  const [unit, setUnit] = useState<Unit>('plt')
  const frame = useRef<HTMLDivElement>(null)
  const [widest, setWidest] = useState(0)
  useLayoutEffect(() => {
    const element = frame.current
    if (!element) return
    const measure = () => setWidest(Math.max(...[...element.querySelectorAll<HTMLElement>('.inventory-figure')].map((figure) => figure.offsetWidth)))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [unit])
  const stock = useContext(StockReleased) ? RELEASED : inventory
  const total = stock.available + stock.onHold
  const parts = [
    { key: 'onHold', label: 'On hold', tone: 'danger', value: stock.onHold },
    { key: 'available', label: 'Available', tone: 'muted', value: stock.available },
  ] as const
  return (
    <Card
      titleAs="h3"
      label={label}
      size={size}
      title="Inventory"
      actions={<UnitMenu label="Unit" value={unit} options={units} onValueChange={(value) => setUnit(value as Unit)} />}
      summary={{ label: 'Total', value: <Count value={inUnit(total, unit)} id="total" format={(value) => withUnit(value, unit)} /> }}
    >
      {/* The ring keeps its size and only shrinks, to 72 px, when the widest figure would not fit beside it */}
      <div className="inventory" data-size={size} ref={frame} style={{ '--label': `${widest}px` } as CSSProperties}>
        {parts.map(({ key, value }) => (
          <span key={key} className="inventory-figure" data-part={key}>
            <Count value={inUnit(value, unit)} id={key} format={(next) => withUnit(next, unit)} />
          </span>
        ))}
        <RingChart
          className="inventory-ring"
          direction="counterclockwise"
          label="Inventory"
          format={(value) => quantity(value, unit)}
          segments={parts.map(({ label, tone, value }) => ({ value, tone, label }))}
        />
        {parts.map(({ key, label }) => (
          <span key={key} className="inventory-name" data-part={key}>
            <i aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </Card>
  )
}
