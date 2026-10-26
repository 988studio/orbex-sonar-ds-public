import { Switch } from '@orbex/sonar-components/switch'
import { Specimen } from '../Specimen.tsx'
import { interactionStates, isDisabled } from '../states.ts'

export function SwitchStates() {
  return (
    <Specimen
      label="Switches off and on, at rest, hovered, focused, pressed and disabled"
      columns={interactionStates}
      rows={[false, true].map((on) => ({
        name: on ? 'On' : 'Off',
        render: (column) => <Switch label="Shipments" checked={on} readOnly disabled={isDisabled(column)} />,
      }))}
    />
  )
}
