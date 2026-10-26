import { Button } from '@orbex/sonar-components/button'
import { Notice } from '@orbex/sonar-components/notice'
import { Specimen } from '../Specimen.tsx'

const tones = [
  { tone: 'info', name: 'Info', title: 'Take a look:' },
  { tone: 'success', name: 'Success', title: 'Order created.' },
  { tone: 'warning', name: 'Warning', title: 'Carrier changed.' },
  { tone: 'danger', name: 'Danger', title: 'Invoice overdue.' },
] as const

export function NoticeVariants() {
  return (
    <Specimen
      label="Notices in four tones: a message alone, and with a title and an action"
      columns={[{ name: 'Message' }, { name: 'Title, message and action' }]}
      rows={tones.map(({ tone, name, title }) => ({
        name,
        render: (column) => (
          <div style={{ width: 300 }}>
            {column.name === 'Message' ? (
              <Notice tone={tone}>Delivery 04-121A arrives on May 14.</Notice>
            ) : (
              <Notice tone={tone} title={title} action={<Button size="small" variant="text">Review</Button>}>
                Delivery 04-121A arrives on May 14.
              </Notice>
            )}
          </div>
        ),
      }))}
    />
  )
}
