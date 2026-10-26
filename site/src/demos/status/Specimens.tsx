import { Status } from '@orbex/sonar-components/status'
import { Specimen } from '../Specimen.tsx'

const tones = [
  { tone: 'neutral', name: 'Neutral', word: 'Scheduled' },
  { tone: 'positive', name: 'Positive', word: 'Delivered' },
  { tone: 'warning', name: 'Warning', word: 'In transit' },
  { tone: 'danger', name: 'Danger', word: 'Delayed' },
] as const

export function StatusVariants() {
  return (
    <Specimen
      label="Status in four tones, as a dot and as a chip"
      columns={[{ name: 'Dot' }, { name: 'Chip' }]}
      rows={tones.map(({ tone, name, word }) => ({
        name,
        render: (column) => (
          <Status tone={tone} appearance={column.name === 'Chip' ? 'chip' : 'dot'}>
            {word}
          </Status>
        ),
      }))}
    />
  )
}
