import { SegmentedControl } from '@orbex/sonar-components/segmented-control'
import { CalendarIcon, GridIcon, ListIcon } from '../icons.tsx'
import { Specimen } from '../Specimen.tsx'

const text = [
  { value: 'plt', label: 'Pallets' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'items', label: 'Items' },
]
const icons = [
  { value: 'list', label: 'List', icon: <ListIcon /> },
  { value: 'grid', label: 'Grid', icon: <GridIcon /> },
  { value: 'calendar', label: 'Calendar', icon: <CalendarIcon /> },
]

/* Hover draws on the options not chosen; focus and press follow the one being acted on, so they are best seen live */
export function SegmentedStates() {
  return (
    <Specimen
      label="Segmented controls with text and with icons only, medium and small, at rest, with the options not chosen hovered, and disabled"
      columns={[{ name: 'Rest' }, { name: 'Hover', preview: 'hover' }, { name: 'Disabled' }]}
      rows={[
        { name: 'Text · medium', options: text, iconOnly: false, size: 'medium' as const },
        { name: 'Text · small', options: text, iconOnly: false, size: 'small' as const },
        { name: 'Icons · medium', options: icons, iconOnly: true, size: 'medium' as const },
        { name: 'Icons · small', options: icons, iconOnly: true, size: 'small' as const },
      ].map(({ name, options, iconOnly, size }) => ({
        name,
        render: (column) => (
          <SegmentedControl legend={name} hideLegend options={options} iconOnly={iconOnly} size={size} value={options[0]!.value} onValueChange={() => {}} disabled={column.name === 'Disabled'} />
        ),
      }))}
    />
  )
}
