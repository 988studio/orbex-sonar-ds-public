import { Card, CardLink, UnitMenu } from '@orbex/sonar-components/card'
import { useState } from 'react'
import Calendar, { type CalendarView } from './Calendar.tsx'
import DetailsPanel, { type DetailsTarget } from './DetailsPanel.tsx'
import { TODAY, units, type Unit } from './data.ts'
import './cards.css'

/**
 * Deliveries, in M, L or XL: the calendar of deliveries and those of the chosen day. The week keeps the chosen day in
 * the middle; the month shows the whole grid and the card grows to fit it. In the week, the list scrolls when the
 * size leaves no room for it, and XL previews the next day with deliveries, faded and out of the tab order.
 * View opens the delivery’s details in a side panel.
 */
export default function DeliveriesCard({ size = 'l', label }: { size?: 'm' | 'l' | 'xl'; label?: string }) {
  const [unit, setUnit] = useState<Unit>('plt')
  const [day, setDay] = useState(TODAY)
  const [view, setView] = useState<CalendarView>('week')
  const [details, setDetails] = useState<DetailsTarget | null>(null)
  return (
    <Card
      titleAs="h3"
      label={label}
      size={view === 'month' ? undefined : size}
      title="Deliveries"
      actions={<UnitMenu label="Unit" value={unit} options={units} onValueChange={(value) => setUnit(value as Unit)} />}
      footer={<CardLink href="/patterns/overview/#card-deliveries">Go to Deliveries</CardLink>}
    >
      <Calendar
        kind="delivery"
        day={day}
        onDayChange={setDay}
        view={view}
        onViewChange={setView}
        unit={unit}
        peek={size === 'xl'}
        openRow={details?.id}
        onDetails={(row, date) => setDetails({ kind: 'delivery', id: row.id, date })}
      />
      <DetailsPanel target={details} onClose={() => setDetails(null)} unit={unit} />
    </Card>
  )
}
