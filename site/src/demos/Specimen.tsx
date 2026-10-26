import type { ReactNode } from 'react'
import './specimen.css'

export type PreviewState = 'hover' | 'focus' | 'pressed'

export interface SpecimenColumn {
  name: string
  /** A state drawn without interaction: the component looks hovered, focused or pressed */
  preview?: PreviewState
}

export interface SpecimenRow<Column extends SpecimenColumn> {
  name: string
  /** A state for the whole row, when states run down rather than across */
  preview?: PreviewState
  render: (column: Column) => ReactNode
}

/**
 * A grid of one component: variants down, sizes or states across. It is a picture for reference: inert and out of the
 * accessibility tree, so its many copies are neither tab stops nor read twice. The live examples are the ones to use.
 * A wide grid scrolls inside its own block.
 */
export function Specimen<Column extends SpecimenColumn>({ label, columns, rows }: { label: string; columns: Column[]; rows: SpecimenRow<Column>[] }) {
  return (
    /* Named for what it pictures; when the grid is wider than the page, the frame takes focus so the keyboard can scroll it */
    <div className="specimen-frame" data-scroll-region role="img" aria-label={label}>
      <div className="specimen" inert aria-hidden="true" style={{ gridTemplateColumns: `auto repeat(${columns.length}, max-content)` }}>
        <span />
        {columns.map((column) => (
          <span key={column.name} className="specimen-head">
            {column.name}
          </span>
        ))}
        {rows.map((row) => [
          <span key={`${row.name}-name`} className="specimen-name">
            {row.name}
          </span>,
          ...columns.map((column) => (
            <div key={`${row.name}-${column.name}`} className="specimen-cell" data-preview={column.preview ?? row.preview}>
              {row.render(column)}
            </div>
          )),
        ])}
      </div>
    </div>
  )
}
