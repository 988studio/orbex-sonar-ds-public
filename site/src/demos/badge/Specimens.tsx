import { Badge } from '@orbex/sonar-components/badge'
import { Specimen } from '../Specimen.tsx'

interface Form {
  name: string
  count?: number
}

const forms: Form[] = [
  { name: 'Dot' },
  { name: 'One digit', count: 3 },
  { name: 'Two digits', count: 42 },
  { name: 'Over the maximum', count: 128 },
]

export function BadgeVariants() {
  return (
    <Specimen<Form>
      label="Badges in the danger and accent tones: a dot, one digit, two digits and a count over the maximum, shown as 99+"
      columns={forms}
      rows={(['danger', 'accent'] as const).map((tone) => ({
        name: tone === 'danger' ? 'Danger' : 'Accent',
        render: (form) => <Badge tone={tone} count={form.count} />,
      }))}
    />
  )
}
