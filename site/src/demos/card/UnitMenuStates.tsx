import { Card } from '@orbex/sonar-components/card'
import { ChevronDownMark } from '../../../../packages/components/src/internal/icons.tsx'
import { CheckMark } from '../Marks.tsx'
import { Specimen } from '../Specimen.tsx'

/*
 * The unit menu through a change of unit, at a desktop card’s width and a phone’s: closed, open on the chosen unit,
 * and after choosing kilograms. Drawn in place with the components' own classes, since an open menu only exists while
 * someone holds it open; the live example above is the component.
 */
const units = [
  { value: 'plt', name: 'Pallets' },
  { value: 'kg', name: 'Kilograms' },
  { value: 'items', name: 'Items' },
]

function Pill({ unit, open }: { unit: string; open?: boolean }) {
  return (
    <span className="sonar-unit-menu" data-popup-open={open ? '' : undefined}>
      {unit}
      <ChevronDownMark />
    </span>
  )
}

function Header({ width, unit, open }: { width: number; unit: string; open?: boolean }) {
  const total = unit === 'kg' ? '1,176,000 kg' : '2,800 plt'
  return (
    <div style={{ position: 'relative', width }}>
      <Card titleAs="h3" title="Inventory" actions={<Pill unit={unit} open={open} />} summary={{ label: 'Total', value: total }} />
      {open && (
        <div className="sonar-menu" style={{ position: 'absolute', top: 52, right: 20, zIndex: 1, width: 180 }}>
          <div className="sonar-menu-group-label">Unit</div>
          {units.map(({ value, name }) => (
            <div key={value} className="sonar-menu-item" data-highlighted={value === 'kg' ? '' : undefined}>
              <span className="sonar-menu-label">{name}</span>
              {value === unit && (
                <span className="sonar-menu-check">
                  <CheckMark />
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function UnitMenuStates() {
  return (
    <Specimen
      label="The unit menu on a desktop card and a phone card: closed in pallets, open on Pallets with Kilograms highlighted, and after choosing kilograms"
      columns={[
        { name: 'Desktop card, 400 px' },
        { name: 'Phone card, 342 px' },
      ]}
      rows={[
        { name: 'Closed', render: (column) => <Header width={column.name.startsWith('Desktop') ? 400 : 342} unit="plt" /> },
        {
          name: 'Menu open',
          render: (column) => (
            <div style={{ paddingBottom: 132 }}>
              <Header width={column.name.startsWith('Desktop') ? 400 : 342} unit="plt" open />
            </div>
          ),
        },
        { name: 'Kilograms chosen', render: (column) => <Header width={column.name.startsWith('Desktop') ? 400 : 342} unit="kg" /> },
      ]}
    />
  )
}
