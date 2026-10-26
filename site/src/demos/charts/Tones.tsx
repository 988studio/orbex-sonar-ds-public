import { ChartLegend } from '@orbex/sonar-components/chart-legend'
import { TickBar } from '@orbex/sonar-components/tick-bar'
import { Specimen } from '../Specimen.tsx'

const tones = [
  { tone: 'accent', name: 'Accent', use: 'First series' },
  { tone: 'strong', name: 'Strong', use: 'Second series' },
  { tone: 'muted', name: 'Rest', use: 'Rest of a whole' },
  { tone: 'danger', name: 'Danger', use: 'Alert' },
  { tone: 'warning', name: 'Warning', use: 'Caution' },
] as const

export function ChartTones() {
  return (
    <Specimen
      label="The five chart tones as a tick bar and as a legend entry"
      columns={[{ name: 'Tick bar' }, { name: 'Legend' }]}
      rows={tones.map(({ tone, name, use }) => ({
        name,
        render: (column) =>
          column.name === 'Tick bar' ? (
            <TickBar label={name} style={{ width: 160 }} segments={[{ value: 1, tone, label: use }]} />
          ) : (
            <ChartLegend items={[{ label: use, tone }]} />
          ),
      }))}
    />
  )
}
