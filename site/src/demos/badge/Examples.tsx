import { Badge } from '@orbex/sonar-components/badge'
import { IconButton } from '@orbex/sonar-components/icon-button'
import { NotificationsIcon } from '../icons.tsx'

/* A badge sits in the flow or is placed by its container; it does not position itself.
   When the element it sits on already says what it counts, the badge is hidden from assistive technology. */
export default function Examples() {
  return (
    <>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, font: 'var(--sonar-type-label-lg)' }}>
        Payments <Badge count={3} label="3 unpaid invoices" />
      </span>
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <IconButton label="Notifications, 12 unread" icon={<NotificationsIcon />} />
        <Badge count={12} aria-hidden style={{ position: 'absolute', top: -2, right: -4 }} />
      </span>
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <IconButton label="Notifications, new" icon={<NotificationsIcon />} />
        <Badge aria-hidden style={{ position: 'absolute', top: 7, right: 8 }} />
      </span>
      <Badge count={128} tone="accent" label="128 new documents" />
    </>
  )
}
