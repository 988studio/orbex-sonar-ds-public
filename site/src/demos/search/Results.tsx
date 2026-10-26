import { SearchResult } from '@orbex/sonar-components/search'
import { Status } from '@orbex/sonar-components/status'
import { ReceiptIcon, ShippingIcon, TuneIcon } from '../icons.tsx'

/* Results as SearchField draws them: what it is, when, and its state; a page has its section instead. Here in a
   plain list, for reference */
export default function Results() {
  return (
    <ul role="list" style={{ display: 'grid', gap: 4, width: '100%', maxWidth: 420, padding: 0 }}>
      <li className="sonar-search-item">
        <SearchResult icon={<ShippingIcon />} title="04-127C 1 item · 15 plt" description="Delivery · Tue May 12" trailing={<Status tone="warning">Delayed</Status>} />
      </li>
      <li className="sonar-search-item">
        <SearchResult icon={<ReceiptIcon />} title="INV-7712 · 30,000 USD" description="Invoice · Tue May 12" trailing={<Status tone="warning">Due today</Status>} />
      </li>
      <li className="sonar-search-item">
        <SearchResult icon={<TuneIcon />} title="Editing the overview" description="Page · Patterns" />
      </li>
    </ul>
  )
}
