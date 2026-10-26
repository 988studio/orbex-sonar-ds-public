import { Checkbox } from '@orbex/sonar-components/checkbox'
import { Specimen } from '../Specimen.tsx'
import { interactionStates, isDisabled } from '../states.ts'

/* A checkbox draws no pressed state of its own: the check appears on release */
const states = interactionStates.filter(({ name }) => name !== 'Pressed')

export function CheckboxStates() {
  return (
    <Specimen
      label="Checkboxes unchecked, checked and indeterminate, at rest, hovered, focused and disabled"
      columns={states}
      rows={[
        { name: 'Unchecked', checked: false, indeterminate: false },
        { name: 'Checked', checked: true, indeterminate: false },
        { name: 'Indeterminate', checked: false, indeterminate: true },
      ].map(({ name, checked, indeterminate }) => ({
        name,
        render: (column) => <Checkbox label="Delivered" checked={checked} indeterminate={indeterminate} readOnly disabled={isDisabled(column)} />,
      }))}
    />
  )
}
