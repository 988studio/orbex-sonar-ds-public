import { CardLink, UnitMenu } from '@orbex/sonar-components/card'
import { Specimen } from '../Specimen.tsx'
import { units } from '@orbex/sonar-patterns/patterns/data.ts'

const rows = {
  unit: { name: 'Unit menu', render: () => <UnitMenu label="Unit" value="plt" options={units} onValueChange={() => {}} /> },
  link: { name: 'Card link', render: () => <CardLink href="/patterns/overview/#card-orders">Go to Orders</CardLink> },
}

/** The card’s own controls at rest, hovered, focused and pressed: both, or one of them */
export function CardPartStates({ only }: { only?: keyof typeof rows }) {
  const shown = only ? [rows[only]] : [rows.unit, rows.link]
  return (
    <Specimen
      label={`${shown.map(({ name }) => `The ${name.toLowerCase()}`).join(' and ')} at rest, hovered, focused and pressed`}
      columns={[{ name: 'Rest' }, { name: 'Hover', preview: 'hover' }, { name: 'Focus', preview: 'focus' }, { name: 'Pressed', preview: 'pressed' }]}
      rows={shown}
    />
  )
}
