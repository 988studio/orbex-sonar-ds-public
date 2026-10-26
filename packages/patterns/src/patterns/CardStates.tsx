import { Card, CardLink, UnitMenu } from '@orbex/sonar-components/card'
import { TickBar } from '@orbex/sonar-components/tick-bar'
import type { ReactNode } from 'react'
import { units } from './data.ts'
import { Guide, Handles } from './EditGrid.tsx'
import './edit.css'

/*
 * The states of a card while the overview is edited, drawn in place as the overview draws them: the dashed edge and
 * its handles, a handle hovered or focused, the lifted card and its drop placeholder, and the size while it changes.
 * A picture for reference: inert and out of the accessibility tree. The live editing demo is the one to use.
 */

const parts = [
  { label: 'Shipped', tone: 'accent', value: 1420 },
  { label: 'On hold', tone: 'strong', value: 80 },
  { label: 'Pending', tone: 'muted', value: 1100 },
] as const

/** The card every state starts from: Orders, its open total and May as a tick bar */
export function OrdersMini({ children, footer = true }: { children?: ReactNode; footer?: boolean }) {
  return (
    <Card
      titleAs="h3"
      title="Orders"
      actions={<UnitMenu label="Unit" value="plt" options={units} onValueChange={() => {}} />}
      summary={{ label: 'Open total', value: '3,940 plt' }}
      footer={footer ? <CardLink href="/patterns/overview/#card-orders">Go to Orders</CardLink> : undefined}
    >
      {children ?? <TickBar label="May orders" segments={[...parts]} />}
    </Card>
  )
}

const edit = (content: ReactNode, attributes: Record<string, string> = {}, before?: ReactNode) => (
  <div className="edit-card" data-editing="" {...attributes}>
    {before}
    <div className="edit-body">
      <OrdersMini />
      {content}
    </div>
  </div>
)

/* The states the overview draws while it is edited, in the order they happen */
const states: { name: string; render: () => ReactNode }[] = [
  { name: 'Rest', render: () => <div className="edit-card"><div className="edit-body"><OrdersMini /></div></div> },
  { name: 'Edit: move, remove and resize', render: () => edit(<Handles title="Orders" size="M" />) },
  { name: 'Hover on the move handle', render: () => edit(<Handles title="Orders" size="M" preview={{ move: 'hover' }} />) },
  { name: 'Focus on the move handle', render: () => edit(<Handles title="Orders" size="M" preview={{ move: 'focus' }} />) },
  { name: 'Hover on remove', render: () => edit(<Handles title="Orders" size="M" preview={{ remove: 'hover' }} />) },
  {
    name: 'Lifted: elevation 4',
    render: () => edit(<Handles title="Orders" size="M" preview={{ move: 'on' }} />, { 'data-lifted': '' }, <span className="edit-placeholder" />),
  },
  { name: 'Drop placeholder', render: () => <div className="edit-card"><span className="edit-placeholder" /></div> },
  { name: 'Resizing: M · 375 px', render: () => edit(<Handles title="Orders" size="M" preview={{ resize: 'on' }} guide={<Guide size="M" aligned={false} />} />) },
  { name: 'Resizing: columns aligned', render: () => edit(<Handles title="Orders" size="M" preview={{ resize: 'on' }} guide={<Guide size="M" aligned />} />) },
]

export function CardStates() {
  return (
    <div
      className="card-states"
      role="img"
      aria-label="The states of a card while the overview is edited: at rest; in edit mode with a dashed edge, the move handle, the remove button and the resize handle with its size; the move handle hovered and focused; remove hovered; lifted while dragged; the drop placeholder; and resizing, with the size and with the columns aligned"
    >
      {states.map(({ name, render }) => (
        <figure key={name} className="card-state" inert aria-hidden="true">
          <figcaption>{name}</figcaption>
          {render()}
        </figure>
      ))}
    </div>
  )
}

const pin = (number: number, style: Record<string, string>) => (
  <span className="anatomy-pin" style={style} aria-hidden="true">
    {number}
  </span>
)

/** The anatomy of a card, numbered: the pins sit on the parts the list beside it names */
export function CardAnatomy() {
  return (
    <div className="anatomy-figure" role="img" aria-label="A card of the overview with its six parts numbered: title, unit menu, summary, content, scrolling list and footer">
      <div inert aria-hidden="true" style={{ position: 'relative' }}>
        <OrdersMini>
          <TickBar label="May orders" segments={[...parts]} />
          <div style={{ marginTop: 16, padding: '8px 0', borderBlock: '1px solid var(--sonar-color-divider)', color: 'var(--sonar-color-text-tertiary)', font: 'var(--sonar-type-label-sm)' }}>
            Rows that scroll first
          </div>
        </OrdersMini>
        {pin(1, { top: '14px', left: '-10px' })}
        {pin(2, { top: '14px', right: '-10px' })}
        {pin(3, { top: '58px', left: '-10px' })}
        {pin(4, { top: '80px', left: '-10px' })}
        {pin(5, { top: '117px', right: '-10px' })}
        {pin(6, { bottom: '22px', left: '-10px' })}
      </div>
    </div>
  )
}

/** The same card in edit mode, numbered: the dashed edge and the three controls the overview adds to it */
export function EditAnatomy() {
  return (
    <div className="anatomy-figure" role="img" aria-label="A card in edit mode with its parts numbered: the move handle, the remove button, the dashed edge, the resize handle and the size">
      <div inert aria-hidden="true" className="edit-card" data-editing="" style={{ position: 'relative' }}>
        <div className="edit-body">
          <OrdersMini />
          <Handles title="Orders" size="M" />
        </div>
        {pin(1, { top: '-11px', left: 'calc(50% - 50px)' })}
        {pin(2, { top: '-11px', right: '20px' })}
        {pin(3, { top: '96px', left: '-10px' })}
        {pin(4, { bottom: '-11px', left: 'calc(50% - 50px)' })}
        {pin(5, { bottom: '-11px', left: 'calc(50% + 54px)' })}
      </div>
    </div>
  )
}
