import { Card, CardLink } from '@orbex/sonar-components/card'
import { ScrollArea } from '@orbex/sonar-components/scroll-area'
import { DownloadIcon } from '../icons.tsx'

const invoices = [
  ['Tuesday, May 12', 'INV-0025698', '04-118B'],
  ['Monday, May 11', 'INV-0025677', '04-121A'],
  ['Monday, May 11', 'INV-0025671', '04-130A'],
  ['Friday, May 8', 'INV-0025664', '04-112B'],
  ['Thursday, May 7', 'INV-0025642', '04-109C'],
  ['Wednesday, May 6', 'INV-0025631', '04-104A'],
] as const

/* The Invoices card: the list scrolls between the heading and the footer. Its first rule is the heading's (1.0.0-alpha.23:
   the list drew a second one under it), as in the product, where the rule is the list's first line. No scrollbar of the system: the indicator
   runs in the card's padding, beside the download buttons, never over them */
export default function Invoices() {
  return (
    <Card titleAs="h3" title="Invoices" size="m" footer={<CardLink href="/patterns/cards/#optional">Go to Invoices</CardLink>}>
      <ScrollArea label="Invoices" style={{ flex: '1 1 0' }}>
        <ul role="list" style={{ margin: 0, padding: 0 }}>
          {invoices.map(([date, number, order]) => (
            <li key={number} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, height: 66, borderBottom: '1px solid var(--sonar-color-divider)' }}>
              <span style={{ font: '400 12px/16px var(--sonar-font-family-sans)', color: 'var(--sonar-color-text-meta)' }}>
                {date}
                <br />
                <strong style={{ color: 'var(--sonar-color-text-strong)', fontWeight: 600 }}>{number}</strong>
                <br />
                {`Order ${order}`}
              </span>
              <button
                type="button"
                aria-label={`Download ${number}`}
                style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, padding: 0, border: 0, borderRadius: '50%', background: 'none', color: 'var(--sonar-color-accent)', boxShadow: 'inset 0 0 0 1px var(--sonar-color-accent)' }}
              >
                <DownloadIcon style={{ width: 15, height: 15 }} />
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </Card>
  )
}
