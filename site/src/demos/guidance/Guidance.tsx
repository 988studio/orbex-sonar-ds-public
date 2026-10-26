import { Badge } from '@orbex/sonar-components/badge'
import { Button } from '@orbex/sonar-components/button'
import { Card, CardLink, CardScroll, UnitMenu } from '@orbex/sonar-components/card'
import { ChartLegend } from '@orbex/sonar-components/chart-legend'
import { Checkbox } from '@orbex/sonar-components/checkbox'
import { SelectField, TextField } from '@orbex/sonar-components/field'
import { IconButton } from '@orbex/sonar-components/icon-button'
import { Notice } from '@orbex/sonar-components/notice'
import { RingChart } from '@orbex/sonar-components/ring-chart'
import { SearchResult } from '@orbex/sonar-components/search'
import { SegmentedControl } from '@orbex/sonar-components/segmented-control'
import { Status } from '@orbex/sonar-components/status'
import { Switch } from '@orbex/sonar-components/switch'
import { TickBar } from '@orbex/sonar-components/tick-bar'
import type { ReactNode } from 'react'
import {
  AddCircleIcon,
  AddIcon,
  CalendarIcon,
  CopyIcon,
  DeleteIcon,
  DownloadIcon,
  EditIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  MoreIcon,
  NotificationsIcon,
  PrintIcon,
  ReceiptIcon,
  SearchIcon,
  ShareIcon,
  ShippingIcon,
  SparkleIcon,
  TuneIcon,
} from '../icons.tsx'
import { CheckMark, CloseMark } from '../Marks.tsx'
import './guidance.css'

/*
 * Do and don’t for every component and pattern page: each pair shows the same need solved well and badly, drawn
 * with the components themselves. Pictures, not controls: they are inert and out of the accessibility tree; the
 * verdict and its sentence carry the meaning.
 */

interface Example {
  text: string
  visual: ReactNode
  /** Stretch the picture to the width of the panel, for lists and cards */
  stretch?: boolean
}

interface Pair {
  do: Example
  dont: Example
}

const noop = () => {}
const units = [
  { value: 'plt', short: 'plt', name: 'Pallets' },
  { value: 'kg', short: 'kg', name: 'Kilograms' },
]
const orderParts = [
  { label: 'Shipped', tone: 'accent', value: 1420 },
  { label: 'On hold', tone: 'strong', value: 80 },
  { label: 'Pending', tone: 'muted', value: 1100 },
] as const
const stock = [
  { label: 'On hold', tone: 'danger', value: 840 },
  { label: 'Available', tone: 'muted', value: 1960 },
] as const

/* ---------- Pieces drawn with the components' own classes, for what only exists while open ---------- */

const MenuPicture = ({ items }: { items: { label: string; icon?: ReactNode; danger?: boolean; separator?: boolean }[] }) => (
  <div className="sonar-menu g-menu">
    {items.map(({ label, icon, danger, separator }, index) =>
      separator ? (
        <div key={index} className="sonar-menu-separator" />
      ) : (
        <div key={index} className="sonar-menu-item" data-tone={danger ? 'danger' : 'default'}>
          {icon && <span className="sonar-menu-icon">{icon}</span>}
          <span className="sonar-menu-label">{label}</span>
        </div>
      ),
    )}
  </div>
)

const ToastPicture = ({ message, action }: { message: string; action?: string }) => (
  <div className="sonar-toast g-toast">
    <p className="sonar-toast-message">{message}</p>
    {action && <span className="sonar-toast-action">{action}</span>}
    <span className="sonar-toast-close">
      <CloseMark />
    </span>
  </div>
)

const DialogPicture = ({ title, text, actions }: { title: string; text: string; actions: ReactNode }) => (
  <div className="g-panel g-dialog">
    <h5 aria-level={3}>{title}</h5>
    <p>{text}</p>
    <div className="g-actions">{actions}</div>
  </div>
)

const SearchPicture = ({ status, children }: { status?: ReactNode; children: ReactNode }) => (
  <div className="g-search">
    <div className="sonar-search-popup">
      {status && <div className="sonar-search-status">{status}</div>}
      <div className="sonar-search-list">{children}</div>
    </div>
  </div>
)

const SearchRow = ({ children }: { children: ReactNode }) => <div className="sonar-search-item">{children}</div>

const MiniCard = ({ children, ...props }: { children?: ReactNode } & Parameters<typeof Card>[0]) => (
  <div className="g-card">
    <Card titleAs="h3" {...props}>
      {children}
    </Card>
  </div>
)

/** A line of a month, drawn small: the trend of daily shipments */
const Spark = ({ values, faded }: { values: number[]; faded?: boolean }) => {
  const max = Math.max(...values)
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 250 + 5},${66 - (value / max) * 56}`).join(' ')
  return (
    <svg className="g-spark" viewBox="0 0 260 72" aria-hidden="true">
      <line x1="5" x2="255" y1="66" y2="66" stroke="var(--sonar-color-chart-axis)" />
      <polyline points={points} fill="none" stroke="var(--sonar-color-chart-primary)" strokeWidth="1.6" strokeLinejoin="round" opacity={faded ? 0.3 : 1} />
    </svg>
  )
}
const april = [355, 375, 310, 510, 405, 430, 325, 305, 300, 285, 405, 455, 370, 295, 350, 445, 450, 395, 365, 335, 310, 360, 345, 285, 485, 360, 365, 340, 330, 375]

/* ---------- The pairs, page by page ---------- */

export const guidance: Record<string, Pair[]> = {
  button: [
    {
      do: { text: 'One filled button per area, for the action the area exists for. The others step down to outlined or text.', visual: <div className="g-row"><Button variant="outlined">Cancel</Button><Button>Place order</Button></div> },
      dont: { text: 'Two filled buttons side by side: neither reads as the next step.', visual: <div className="g-row"><Button>Save draft</Button><Button>Place order</Button></div> },
    },
    {
      do: { text: 'Name the action with a verb and its object, so the button reads on its own.', visual: <Button icon={<DownloadIcon />}>Download invoice</Button> },
      dont: { text: 'Vague labels that need the rest of the screen to make sense.', visual: <div className="g-row"><Button variant="tonal">OK</Button><Button variant="text">Click here</Button></div> },
    },
  ],
  'icon-button': [
    {
      do: { text: 'Icon buttons for familiar actions in toolbars and card headers, standard by default.', visual: <div className="g-row"><IconButton label="Filter" icon={<FilterIcon />} /><IconButton label="Search" icon={<SearchIcon />} /><IconButton label="More" aria-haspopup="menu" aria-expanded={false} icon={<MoreIcon />} /></div> },
      dont: { text: 'A row of filled icon buttons: every one shouts, and none is the main action.', visual: <div className="g-row"><IconButton variant="filled" label="Filter" icon={<FilterIcon />} /><IconButton variant="filled" label="Search" icon={<SearchIcon />} /><IconButton variant="filled" label="More" aria-haspopup="menu" aria-expanded={false} icon={<MoreIcon />} /></div> },
    },
    {
      do: { text: 'A rare or abstract action gets words: a button with a label says what it does.', visual: <Button variant="outlined" icon={<DownloadIcon />}>Export CSV</Button> },
      dont: { text: 'An icon nobody can guess, even with a tooltip to read first.', visual: <IconButton variant="outlined" label="Export CSV" icon={<TuneIcon />} /> },
    },
  ],
  badge: [
    {
      do: { text: 'A count on the thing it counts, with its meaning in the label: “12 unread”.', visual: <span className="g-anchor"><IconButton label="Notifications, 12 unread" icon={<NotificationsIcon />} /><Badge count={12} aria-hidden /></span> },
      dont: { text: 'Words in a badge. A badge holds a number or a dot; a message goes in a notice.', visual: <span className="g-row"><span className="g-meta">Payments</span><span className="sonar-badge" data-tone="accent">New invoices available</span></span> },
    },
    {
      do: { text: 'Cap large counts: 99+ says “a lot” and keeps its size.', visual: <span className="g-row"><span className="g-meta">Documents</span><Badge count={1284} max={99} tone="accent" label="1,284 new documents" /></span> },
      dont: { text: 'A four-digit badge that outgrows what it sits on.', visual: <span className="g-anchor"><IconButton label="Notifications" icon={<NotificationsIcon />} /><span className="sonar-badge" style={{ right: -22 }}>1,284</span></span> },
    },
  ],
  status: [
    {
      do: { text: 'A dot and a word. The word carries the state; the color helps scanning.', visual: <div className="g-stack"><Status tone="warning">Delayed</Status><Status tone="positive">Delivered</Status><Status>Scheduled</Status></div> },
      dont: { text: 'Color alone. Without the word, the state is lost to anyone who cannot tell the hues apart.', visual: <ul className="g-list"><li>04-121A <span className="g-dot" style={{ background: 'var(--sonar-color-warning)' }} /></li><li>04-118B <span className="g-dot" style={{ background: 'var(--sonar-color-accent)' }} /></li><li>04-133B <span className="g-dot" style={{ background: 'var(--sonar-color-border-emphasis)' }} /></li></ul>, stretch: true },
    },
    {
      do: { text: 'One or two words. The detail goes in the panel the row opens.', visual: <Status tone="warning" appearance="chip">Due today</Status> },
      dont: { text: 'A sentence in a status: it wraps, and the list stops scanning.', visual: <Status tone="warning" appearance="chip">Delayed by the carrier at the port, new date pending</Status> },
    },
  ],
  switch: [
    {
      do: { text: 'A switch acts at once: the setting is on as soon as it is turned on.', visual: <div className="g-stack"><Switch label="Email me when a delivery is late" defaultChecked /><Switch label="Show weekends in calendars" /></div> },
      dont: { text: 'Switches in a form that waits for Save. Choices confirmed later are checkboxes.', visual: <div className="g-stack"><Switch label="Include returns" defaultChecked /><Switch label="Include drafts" /><div className="g-actions"><Button size="small">Save</Button></div></div> },
    },
    {
      do: { text: 'Name the setting in positive words, so on means yes.', visual: <Switch label="Show weekends" defaultChecked /> },
      dont: { text: 'A negative label, where on means no.', visual: <Switch label="Don’t hide weekends" /> },
    },
  ],
  checkbox: [
    {
      do: { text: 'Checkboxes for choices that are confirmed together, by a button after them.', visual: <div className="g-stack"><Checkbox label="Corrugated box / Double wall" defaultChecked /><Checkbox label="Stretch film 23 µm" /><div className="g-actions"><Button size="small">Reorder</Button></div></div> },
      dont: { text: 'A checkbox that changes something at once. That is a switch.', visual: <div className="g-stack"><Checkbox label="Dark theme (applies now)" defaultChecked /></div> },
    },
    {
      do: { text: 'Select all shows mixed while only some rows are chosen.', visual: <div className="g-stack"><Checkbox label="All products" indeterminate /><Checkbox label="Corrugated box" defaultChecked /><Checkbox label="Stretch film" /></div> },
      dont: { text: 'Select all checked while a row is not: the two disagree.', visual: <div className="g-stack"><Checkbox label="All products" defaultChecked /><Checkbox label="Corrugated box" defaultChecked /><Checkbox label="Stretch film" /></div> },
    },
  ],
  'segmented-control': [
    {
      do: { text: 'Two to five short options that change the view of the same content.', visual: <SegmentedControl legend="View" hideLegend size="small" defaultValue="week" options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} /> },
      dont: { text: 'Seven options, or long ones: use a select.', visual: <SegmentedControl legend="Day" hideLegend size="small" defaultValue="tue" options={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ value: day.toLowerCase(), label: day }))} /> },
    },
    {
      do: { text: 'Icons alone only when each one is familiar; the labels stay for screen readers.', visual: <SegmentedControl legend="View" hideLegend iconOnly size="small" defaultValue="list" options={[{ value: 'list', label: 'List', icon: <ListIcon /> }, { value: 'grid', label: 'Grid', icon: <GridIcon /> }, { value: 'calendar', label: 'Calendar', icon: <CalendarIcon /> }]} /> },
      dont: { text: 'Actions in a segmented control. It chooses a state; buttons act.', visual: <SegmentedControl legend="Actions" hideLegend size="small" defaultValue="save" options={[{ value: 'save', label: 'Save' }, { value: 'print', label: 'Print' }, { value: 'delete', label: 'Delete' }]} /> },
    },
  ],
  field: [
    {
      do: { text: 'A label above the field, always visible; the placeholder is an example.', visual: <div className="g-stack"><TextField label="Reference" placeholder="PO-2210" /></div> },
      dont: { text: 'The placeholder as the label: it disappears as soon as someone types.', visual: <div className="g-stack"><TextField label={<span className="visually-hidden">Reference</span>} placeholder="Reference" /></div> },
    },
    {
      do: { text: 'An error that says what is wrong and how to fix it.', visual: <div className="g-stack"><TextField label="Quantity (plt)" defaultValue="0" error="Enter a quantity above zero." /></div> },
      dont: { text: 'An error that only says something is wrong.', visual: <div className="g-stack"><TextField label="Quantity (plt)" defaultValue="0" error="Invalid input." /></div> },
    },
    {
      do: { text: 'A select for one choice among many, with a sensible default.', visual: <div className="g-stack"><SelectField label="Delivery month" defaultValue="June"><option>June</option><option>July</option><option>August</option></SelectField></div> },
      dont: { text: 'A select for two options. Two choices side by side are quicker to compare.', visual: <div className="g-stack"><SelectField label="Show" defaultValue="Week"><option>Week</option><option>Month</option></SelectField></div> },
    },
  ],
  notice: [
    {
      do: { text: 'A notice for a situation that lasts, with the step that resolves it.', visual: <div className="g-stack" style={{ maxWidth: 320 }}><Notice tone="warning" title="Carrier changed." action={<Button size="small" variant="text">Review</Button>}>Delivery 04-121A now arrives with Atlas Logistics.</Notice></div> },
      dont: { text: 'A notice for something that just happened and needs nothing. That is a toast.', visual: <div className="g-stack" style={{ maxWidth: 320 }}><Notice tone="success" title="Layout saved." >Your overview was updated.</Notice></div> },
    },
    {
      do: { text: 'One notice, the one that matters most.', visual: <div className="g-stack" style={{ maxWidth: 320 }}><Notice tone="danger" title="2 invoices overdue.">Pay them before May 20 to keep your credit line.</Notice></div> },
      dont: { text: 'A stack of notices: none of them stands out any more.', visual: <div className="g-stack" style={{ maxWidth: 320, gap: 6 }}><Notice tone="danger" title="2 invoices overdue.">Pay before May 20.</Notice><Notice tone="warning" title="Carrier changed.">04-121A.</Notice><Notice title="Take a look:">New boxes.</Notice></div> },
    },
  ],
  toast: [
    {
      do: { text: 'A toast confirms what just happened, and offers to undo it.', visual: <ToastPicture message="Recurring orders removed." action="Undo" /> },
      dont: { text: 'A toast for a problem that needs action: it leaves before it is read. Use a notice or a dialog.', visual: <ToastPicture message="Payment failed. Update your card details in Settings before Friday." /> },
    },
    {
      do: { text: 'A few words, on one line.', visual: <ToastPicture message="Layout saved." action="Undo" /> },
      dont: { text: 'A paragraph in a toast.', visual: <ToastPicture message="Your layout was saved. Cards you hid stay hidden on every device until you show them again from Edit layout." /> },
    },
  ],
  menu: [
    {
      do: { text: 'Verbs, grouped; the destructive item last, after a separator, in danger.', visual: <MenuPicture items={[{ label: 'Duplicate order', icon: <CopyIcon /> }, { label: 'Download PDF', icon: <DownloadIcon /> }, { label: 'Print', icon: <PrintIcon /> }, { label: '', separator: true }, { label: 'Cancel order', icon: <DeleteIcon />, danger: true }]} /> },
      dont: { text: 'A destructive item among the others, one slip away from the common ones.', visual: <MenuPicture items={[{ label: 'Duplicate order', icon: <CopyIcon /> }, { label: 'Cancel order', icon: <DeleteIcon /> }, { label: 'Download PDF', icon: <DownloadIcon /> }, { label: 'Print', icon: <PrintIcon /> }]} /> },
    },
    {
      do: { text: 'A short menu of actions on one thing.', visual: <MenuPicture items={[{ label: 'Share', icon: <ShareIcon /> }, { label: 'Download PDF', icon: <DownloadIcon /> }, { label: 'Print', icon: <PrintIcon /> }]} /> },
      dont: { text: 'A long list of places or records. That is navigation, a select or search.', visual: <MenuPicture items={['Central DC', 'Main warehouse', 'North hub', 'South hub', 'East dock', 'West dock', 'Port terminal'].map((label) => ({ label }))} /> },
    },
  ],
  tooltip: [
    {
      do: { text: 'A tooltip names an icon button, in a few words.', visual: <span className="g-tooltip-stack"><span className="sonar-tooltip">Edit layout</span><IconButton label="Edit layout" icon={<EditIcon />} /></span> },
      dont: { text: 'A tooltip that repeats a button’s own label.', visual: <span className="g-tooltip-stack"><span className="sonar-tooltip">Save</span><Button size="small">Save</Button></span> },
    },
    {
      do: { text: 'Information someone needs to act goes on the page, where it stays.', visual: <div className="g-stack"><TextField label="Quantity (plt)" description="Full pallets only: 1 plt is 36 items." defaultValue="12" /></div> },
      dont: { text: 'Essential instructions in a tooltip: hard to find, gone on touch, never interactive.', visual: <span className="g-tooltip-stack"><span className="sonar-tooltip">Full pallets only. 1 plt is 36 items. See the packaging guide to learn more.</span><IconButton size="small" label="Help" icon={<SparkleIcon />} /></span> },
    },
  ],
  dialog: [
    {
      do: { text: 'A title that asks the question, and buttons that answer it with verbs.', visual: <DialogPicture title="Discard this order?" text="The products and quantities you entered will be lost." actions={<><Button size="small" variant="text">Keep editing</Button><Button size="small" variant="tonal">Discard</Button></>} /> },
      dont: { text: '“Are you sure?” with OK and Cancel: people must read the text to know what OK does.', visual: <DialogPicture title="Are you sure?" text="This action cannot be undone." actions={<><Button size="small" variant="text">Cancel</Button><Button size="small">OK</Button></>} /> },
    },
    {
      do: { text: 'Ask only when the step cannot be undone. Otherwise act, and offer Undo.', visual: <ToastPicture message="Card hidden." action="Undo" /> },
      dont: { text: 'A dialog for every small step: people learn to press OK without reading.', visual: <DialogPicture title="Hide this card?" text="You can show it again from Edit layout." actions={<><Button size="small" variant="text">Cancel</Button><Button size="small">Hide</Button></>} /> },
    },
  ],
  card: [
    {
      do: { text: 'One figure first, with its unit; the content explains it.', visual: <MiniCard title="Orders" summary={{ label: 'Open total', value: '3,940 plt' }}><TickBar label="May orders" segments={[...orderParts]} /></MiniCard>, stretch: true },
      dont: { text: 'Several figures of the same weight: nothing says which one matters.', visual: <MiniCard title="Orders"><div className="g-row" style={{ justifyContent: 'space-between' }}><span className="g-figure">3,940</span><span className="g-figure">1,420</span><span className="g-figure">2,600</span></div></MiniCard>, stretch: true },
    },
    {
      do: { text: 'At most one action, beside the way to the full page.', visual: <MiniCard title="Orders" footer={<CardLink href="#">Go to Orders</CardLink>}><div className="g-row" style={{ justifyContent: 'space-between' }}><span>New order</span><IconButton variant="tonal" label="New order" icon={<AddCircleIcon />} /></div></MiniCard>, stretch: true },
      dont: { text: 'A footer of buttons: the card becomes the page it should lead to.', visual: <MiniCard title="Orders" footer={<div className="g-row"><Button size="small">New</Button><Button size="small" variant="outlined">Import</Button><Button size="small" variant="outlined">Export</Button></div>}><p className="g-meta">3,940 plt open</p></MiniCard>, stretch: true },
    },
  ],
  'card-link': [
    {
      do: { text: 'Say where it goes: “Go to” and the page’s name.', visual: <CardLink href="#">Go to Deliveries</CardLink> },
      dont: { text: '“More” or “Click here”: out of context, they say nothing.', visual: <CardLink href="#">More</CardLink> },
    },
    {
      do: { text: 'One card link, at the foot of the card.', visual: <MiniCard title="Balance" summary={{ label: 'Balance', value: '3,900,000 USD' }} footer={<CardLink href="#">Go to Balance</CardLink>} />, stretch: true },
      dont: { text: 'A card link on every row: rows open their details; the card link leaves the card.', visual: <ul className="g-list"><li>INV-7712 <CardLink href="#">Go to invoice</CardLink></li><li>INV-7716 <CardLink href="#">Go to invoice</CardLink></li></ul>, stretch: true },
    },
  ],
  'card-scroll': [
    {
      do: { text: 'Mark the list that should give way first; the summary and the footer stay in place.', visual: <MiniCard title="Deliveries" size="s" footer={<CardLink href="#">Go to Deliveries</CardLink>}><CardScroll label="Deliveries of May 12"><ul className="g-list"><li>04-118B <Status tone="positive">Delivered</Status></li><li>04-121A <Status tone="warning">Delayed</Status></li><li>04-127C <Status tone="warning">Delayed</Status></li><li>04-130A <Status tone="positive">Delivered</Status></li></ul></CardScroll></MiniCard>, stretch: true },
      dont: { text: 'Content cut at the card’s edge, with nothing to say there is more.', visual: <div className="g-card"><div className="sonar-card" style={{ height: 180, overflow: 'hidden' }}><h5 className="sonar-card-title" aria-level={3} style={{ margin: 0 }}>Deliveries</h5><ul className="g-list"><li>04-118B <Status tone="positive">Delivered</Status></li><li>04-121A <Status tone="warning">Delayed</Status></li><li>04-127C <Status tone="warning">Delayed</Status></li><li>04-130A <Status tone="positive">Delivered</Status></li></ul></div></div>, stretch: true },
    },
    {
      do: { text: 'A label that names the list, read when it takes focus: “Deliveries of May 12”.', visual: <div className="g-panel"><span className="g-meta">label</span><span className="g-figure" style={{ font: 'var(--sonar-type-title-sm)' }}>“Deliveries of May 12”</span></div> },
      dont: { text: 'A generic label: “List”, “Scroll area”. Focus arrives and says nothing useful.', visual: <div className="g-panel"><span className="g-meta">label</span><span className="g-figure" style={{ font: 'var(--sonar-type-title-sm)' }}>“Scroll area”</span></div> },
    },
  ],
  'unit-menu': [
    {
      do: { text: 'The unit is the card’s only setting, at the end of its header.', visual: <MiniCard title="Inventory" actions={<UnitMenu label="Unit" value="plt" options={units} onValueChange={noop} />} summary={{ label: 'Total', value: '2,800 plt' }} />, stretch: true },
      dont: { text: 'Several settings in a card header: unit, period and sort compete with the title.', visual: <MiniCard title="Inventory" actions={<span className="g-row"><UnitMenu label="Unit" value="plt" options={units} onValueChange={noop} /><UnitMenu label="Period" value="m" options={[{ value: 'm', short: 'Month', name: 'Month' }]} onValueChange={noop} /><UnitMenu label="Sort" value="a" options={[{ value: 'a', short: 'A–Z', name: 'A–Z' }]} onValueChange={noop} /></span>} summary={{ label: 'Total', value: '2,800 plt' }} />, stretch: true },
    },
    {
      do: { text: 'A short code on the pill; the full name in the menu.', visual: <UnitMenu label="Unit" value="kg" options={units} onValueChange={noop} /> },
      dont: { text: 'Full words on the pill: it grows and crowds the title.', visual: <UnitMenu label="Unit" value="plt" options={[{ value: 'plt', short: 'Pallets', name: 'Pallets' }]} onValueChange={noop} /> },
    },
  ],
  'tick-bar': [
    {
      do: { text: 'The parts of one whole, in their chart roles, named by a legend.', visual: <div className="g-stack"><TickBar label="May orders" segments={[...orderParts]} /><ChartLegend aria-hidden items={orderParts.map(({ label, tone }) => ({ label, tone }))} /></div> },
      dont: { text: 'Danger for a part that is not an alert: the bar warns where nothing is wrong.', visual: <div className="g-stack"><TickBar label="May orders" segments={[{ label: 'Shipped', tone: 'danger', value: 1420 }, { label: 'On hold', tone: 'strong', value: 80 }, { label: 'Pending', tone: 'muted', value: 1100 }]} /><ChartLegend aria-hidden items={[{ label: 'Shipped', tone: 'danger' }, { label: 'On hold', tone: 'strong' }, { label: 'Pending', tone: 'muted' }]} /></div> },
    },
    {
      do: { text: 'Two or three parts, so each one reads.', visual: <div className="g-stack"><TickBar label="Overdue share" segments={[{ label: 'Overdue', tone: 'danger', value: 2230 }, { label: 'Not due yet', tone: 'muted', value: 1669 }]} /></div> },
      dont: { text: 'Many small parts: the ticks blur into one color.', visual: <div className="g-stack"><TickBar label="By warehouse" segments={[{ label: 'A', tone: 'accent', value: 30 }, { label: 'B', tone: 'strong', value: 20 }, { label: 'C', tone: 'muted', value: 15 }, { label: 'D', tone: 'warning', value: 12 }, { label: 'E', tone: 'danger', value: 8 }, { label: 'F', tone: 'accent', value: 10 }, { label: 'G', tone: 'strong', value: 5 }]} /></div> },
    },
  ],
  'ring-chart': [
    {
      do: { text: 'Parts of a whole, with the figures beside the ring.', visual: <div className="g-row" style={{ gap: 16 }}><span className="g-meta">840 plt<br />On hold</span><RingChart label="Inventory" direction="counterclockwise" segments={[...stock]} style={{ width: 88 }} /><span className="g-meta">1,960 plt<br />Available</span></div> },
      dont: { text: 'A ring for values over time. Months are a sequence: use a bar or a line.', visual: <RingChart label="Orders by month" segments={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label, index) => ({ label, value: 10 + index, tone: (['accent', 'strong', 'muted'] as const)[index % 3]! }))} style={{ width: 88 }} /> },
    },
    {
      do: { text: 'The alert in danger, the rest in the rest tone.', visual: <RingChart label="Inventory" direction="counterclockwise" segments={[...stock]} style={{ width: 88 }} /> },
      dont: { text: 'Every part in a strong color: the one that needs attention no longer stands out.', visual: <RingChart label="Inventory" segments={[{ label: 'On hold', tone: 'danger', value: 840 }, { label: 'Available', tone: 'warning', value: 1960 }]} style={{ width: 88 }} /> },
    },
  ],
  'trend-chart': [
    {
      do: { text: 'A month day by day, with its key figure stated in text beside the chart.', visual: <div className="g-stack"><span className="g-meta">Month total</span><span className="g-figure">11,020 plt</span><Spark values={april} /></div> },
      dont: { text: 'The chart alone: people have to read the line to find the figure they came for.', visual: <div className="g-stack"><Spark values={april} /></div> },
    },
    {
      do: { text: 'A series that is off keeps its name readable, with a hollow marker.', visual: <ChartLegend items={[{ label: 'Shipments (plt)', tone: 'accent' }, { label: 'Cumulative (plt)', tone: 'strong' }]} /> },
      dont: { text: 'A faded series: its name drops below a readable contrast.', visual: <div className="g-stack"><span className="g-row"><ChartLegend items={[{ label: 'Shipments (plt)', tone: 'accent' }]} /><span className="g-faded"><ChartLegend items={[{ label: 'Cumulative (plt)', tone: 'strong' }]} /></span></span><Spark values={april} faded /></div> },
    },
  ],
  'chart-legend': [
    {
      do: { text: 'The legend lists the parts in the order the chart draws them.', visual: <div className="g-stack"><TickBar label="May orders" segments={[...orderParts]} /><ChartLegend aria-hidden items={orderParts.map(({ label, tone }) => ({ label, tone }))} /></div> },
      dont: { text: 'A legend in another order: the eye has to match colors back and forth.', visual: <div className="g-stack"><TickBar label="May orders" segments={[...orderParts]} /><ChartLegend aria-hidden items={[...orderParts].reverse().map(({ label, tone }) => ({ label, tone }))} /></div> },
    },
    {
      do: { text: 'Values in the legend when the chart has no figures of its own.', visual: <ChartLegend items={[{ label: 'Overdue', tone: 'danger', value: '2,230,800 USD' }, { label: 'Not due yet', tone: 'muted', value: '1,669,200 USD' }]} /> },
      dont: { text: 'A legend for a single series: the title already names it.', visual: <div className="g-stack"><span className="g-meta">Daily shipments</span><Spark values={april} /><ChartLegend items={[{ label: 'Shipments', tone: 'accent' }]} /></div> },
    },
  ],
  'search-field': [
    {
      do: { text: 'In a top bar: the magnifier and an example as placeholder; the label stays for screen readers.', visual: <div className="g-search"><div className="sonar-search"><div className="sonar-search-control"><span className="sonar-search-icon"><SearchIcon /></span><input className="sonar-search-input" placeholder="Search…" readOnly tabIndex={-1} /></div></div></div> },
      dont: { text: 'Instructions as placeholder: long, cut off, and gone at the first key.', visual: <div className="g-search"><div className="sonar-search"><div className="sonar-search-control"><span className="sonar-search-icon"><SearchIcon /></span><input className="sonar-search-input" placeholder="Type here to search for orders, deliveries, invoices and more" readOnly tabIndex={-1} /></div></div></div> },
    },
    {
      do: { text: 'An empty result suggests a query that works.', visual: <SearchPicture status="Smart search · deliveries matching “04-999”"><div className="sonar-search-empty">No results. Try “late deliveries” or “INV-77”.</div></SearchPicture> },
      dont: { text: '“No results” and nothing else: a dead end.', visual: <SearchPicture><div className="sonar-search-empty">No results.</div></SearchPicture> },
    },
  ],
  'search-result': [
    {
      do: { text: 'What it is, when it is and its state: an icon, a line under the title and a status.', visual: <SearchPicture><SearchRow><SearchResult icon={<ShippingIcon />} title="04-127C 1 item · 15 plt" description="Delivery · Tue May 12" trailing={<Status tone="warning">Delayed</Status>} /></SearchRow></SearchPicture> },
      dont: { text: 'A bare code: people cannot tell which result they want.', visual: <SearchPicture><SearchRow><SearchResult title="04-127C" /></SearchRow><SearchRow><SearchResult title="04-121A" /></SearchRow></SearchPicture> },
    },
    {
      do: { text: 'The state in words, with Status.', visual: <SearchPicture><SearchRow><SearchResult icon={<ReceiptIcon />} title="INV-7712 · 30,000 USD" description="Invoice · Tue May 12" trailing={<Status tone="warning">Due today</Status>} /></SearchRow></SearchPicture> },
      dont: { text: 'The state as colored text: too faint on the menu surface, and lost without color.', visual: <SearchPicture><SearchRow><SearchResult icon={<ReceiptIcon />} title="INV-7712 · 30,000 USD" description="Invoice · Tue May 12" trailing={<span style={{ color: 'var(--sonar-color-warning)', font: 'var(--sonar-type-label-md)' }}>Due today</span>} /></SearchRow></SearchPicture> },
    },
  ],

  /* ---------- Patterns ---------- */

  overview: [
    {
      do: { text: 'What people check first goes first: Orders and Daily shipments open the reading order.', visual: <div className="g-grid"><span><i data-first style={{ height: 52 }}>Orders</i><i style={{ height: 34 }}>Inv.</i></span><span><i style={{ height: 56 }}>Deliv.</i><i style={{ height: 30 }}>Bal.</i></span><span><i data-first style={{ height: 66 }}>Ship.</i><i style={{ height: 20 }}>Rec.</i></span></div> },
      dont: { text: 'Columns that end at different heights: the overview looks unfinished.', visual: <div className="g-grid"><span><i style={{ height: 52 }}>Orders</i><i style={{ height: 52 }}>Inv.</i></span><span><i style={{ height: 34 }}>Deliv.</i></span><span><i style={{ height: 66 }}>Ship.</i><i style={{ height: 56 }}>Rec.</i></span></div> },
    },
    {
      do: { text: 'Each card answers one question and leads to the page where the work is done.', visual: <MiniCard title="Deliveries" footer={<CardLink href="#">Go to Deliveries</CardLink>}><span className="g-meta">4 deliveries today · 2 delayed</span></MiniCard>, stretch: true },
      dont: { text: 'A card that tries to be the page: tables, filters and bulk actions.', visual: <MiniCard title="Deliveries" actions={<span className="g-row"><IconButton size="small" label="Filter" icon={<FilterIcon />} /><IconButton size="small" label="Add" icon={<AddIcon />} /><IconButton size="small" label="More" aria-haspopup="menu" aria-expanded={false} icon={<MoreIcon />} /></span>}><ul className="g-list"><li><Checkbox label="04-118B" /> <Button size="small" variant="text">Edit</Button></li><li><Checkbox label="04-121A" /> <Button size="small" variant="text">Edit</Button></li></ul></MiniCard>, stretch: true },
    },
  ],
  cards: [
    {
      do: { text: 'A figure keeps its unit beside it, in tabular numerals.', visual: <div className="g-panel"><span className="g-meta">Open total</span><span className="g-figure">3,940 plt</span></div> },
      dont: { text: 'A bare figure: pallets, kilograms or items?', visual: <div className="g-panel"><span className="g-meta">Open total</span><span className="g-figure">3,940</span></div> },
    },
    {
      do: { text: 'Days of another month are left empty in a month grid.', visual: <div className="g-month">{[...Array(4)].map((_, index) => <span key={`e${index}`} />)}{Array.from({ length: 31 }, (_, index) => <span key={index} data-today={index === 11 || undefined}>{index + 1}</span>)}</div> },
      dont: { text: 'Days of the months around it, grayed out: they read as days with nothing on them.', visual: <div className="g-month">{[27, 28, 29, 30].map((day) => <span key={`p${day}`} data-other>{day}</span>)}{Array.from({ length: 31 }, (_, index) => <span key={index} data-today={index === 11 || undefined}>{index + 1}</span>)}</div> },
    },
  ],
  charts: [
    {
      do: { text: 'Color by role: the first part in accent, then strong, the rest in the rest tone.', visual: <div className="g-stack"><TickBar label="May orders" segments={[...orderParts]} /><ChartLegend aria-hidden items={orderParts.map(({ label, tone }) => ({ label, tone }))} /></div> },
      dont: { text: 'Warning and danger for parts that are not alerts: the chart cries wolf.', visual: <div className="g-stack"><TickBar label="May orders" segments={[{ label: 'Shipped', tone: 'warning', value: 1420 }, { label: 'On hold', tone: 'danger', value: 80 }, { label: 'Pending', tone: 'accent', value: 1100 }]} /><ChartLegend aria-hidden items={[{ label: 'Shipped', tone: 'warning' }, { label: 'On hold', tone: 'danger' }, { label: 'Pending', tone: 'accent' }]} /></div> },
    },
    {
      do: { text: 'Labels beside the chart: the card states the key figures in text.', visual: <div className="g-row" style={{ gap: 16 }}><span className="g-meta">840 plt<br />On hold</span><RingChart label="Inventory" direction="counterclockwise" segments={[...stock]} style={{ width: 88 }} /><span className="g-meta">1,960 plt<br />Available</span></div> },
      dont: { text: 'A chart with no figure anywhere: its shape alone has to be decoded.', visual: <RingChart label="Inventory" direction="counterclockwise" segments={[...stock]} style={{ width: 88 }} /> },
    },
  ],
  search: [
    {
      do: { text: 'Say how the text was read, so a wrong reading can be fixed at once.', visual: <SearchPicture status={<><SparkleIcon aria-hidden="true" /> Smart search · delayed deliveries · May 9 – May 15</>}><SearchRow><SearchResult icon={<ShippingIcon />} title="04-127C 1 item · 15 plt" description="Delivery · Tue May 12" trailing={<Status tone="warning">Delayed</Status>} /></SearchRow></SearchPicture> },
      dont: { text: 'Results with no reading: people guess why one is missing.', visual: <SearchPicture><SearchRow><SearchResult icon={<ShippingIcon />} title="04-127C 1 item · 15 plt" description="Delivery · Tue May 12" trailing={<Status tone="warning">Delayed</Status>} /></SearchRow></SearchPicture> },
    },
    {
      do: { text: 'Nearest to today first.', visual: <ul className="g-list"><li>Delivery 04-127C <span className="g-meta">Tue May 12</span></li><li>Invoice INV-7712 <span className="g-meta">Tue May 12</span></li><li>Delivery 04-133B <span className="g-meta">Wed May 13</span></li></ul>, stretch: true },
      dont: { text: 'Oldest first: today’s results sink under months of past ones.', visual: <ul className="g-list"><li>Invoice <span className="g-meta">Mon Mar 2</span></li><li>Delivery <span className="g-meta">Tue Mar 3</span></li><li>Delivery <span className="g-meta">Wed Mar 4</span></li></ul>, stretch: true },
    },
  ],
  editing: [
    {
      do: { text: 'Every edit is a draft: Reset, Cancel and Save layout wait at the foot.', visual: <div className="g-panel" style={{ maxWidth: 320 }}><div className="g-actions" style={{ justifyContent: 'space-between' }}><Button size="small" variant="text">Reset</Button><span className="g-row"><Button size="small" variant="outlined">Cancel</Button><Button size="small">Save layout</Button></span></div></div> },
      dont: { text: 'Each move saved as it happens, with no way back but to move it again.', visual: <ToastPicture message="Card moved. Layout saved." /> },
    },
    {
      do: { text: 'Resizing steps through the sizes a card offers, so columns end level.', visual: <SegmentedControl legend="Orders size" hideLegend size="small" defaultValue="m" options={[{ value: 's', label: 'S' }, { value: 'm', label: 'M' }]} /> },
      dont: { text: 'A free resize: every card a different height, and ragged columns.', visual: <div className="g-grid"><span><i style={{ height: 47 }}>Orders</i><i style={{ height: 31 }}>Inv.</i></span><span><i style={{ height: 63 }}>Deliv.</i></span><span><i style={{ height: 38 }}>Ship.</i><i style={{ height: 52 }}>Rec.</i></span></div> },
    },
  ],
  feedback: [
    {
      do: { text: 'Done: a toast, with Undo when it helps.', visual: <ToastPicture message="Layout saved." action="Undo" /> },
      dont: { text: 'A dialog to say something went well: one more click for nothing.', visual: <DialogPicture title="Success" text="Your layout was saved." actions={<Button size="small">OK</Button>} /> },
    },
    {
      do: { text: 'Ongoing: a notice in the page, until the situation changes.', visual: <div className="g-stack" style={{ maxWidth: 320 }}><Notice tone="danger" title="2 invoices overdue.">Pay them before May 20 to keep your credit line.</Notice></div> },
      dont: { text: 'Ongoing problems in a toast: gone in seconds, and still unresolved.', visual: <ToastPicture message="2 invoices overdue." /> },
    },
  ],
}

const Verdict = ({ kind, example }: { kind: 'do' | 'dont'; example: Example }) => (
  <figure className="guidance-example" data-verdict={kind}>
    <div className="guidance-stage" data-align={example.stretch ? 'stretch' : undefined} inert aria-hidden="true">
      {example.visual}
    </div>
    <figcaption className="guidance-verdict">
      <span className="guidance-label">
        {kind === 'do' ? <CheckMark /> : <CloseMark />}
        {kind === 'do' ? 'Do' : 'Don’t'}
      </span>
      <span className="guidance-text">{example.text}</span>
    </figcaption>
  </figure>
)

export default function Guidance({ page }: { page: string }) {
  const pairs = guidance[page]
  if (!pairs) throw new Error(`No do and don’t for ${page}`)
  return (
    <div className="guidance">
      {pairs.map((pair, index) => (
        <div key={index} className="guidance-pair">
          <Verdict kind="do" example={pair.do} />
          <Verdict kind="dont" example={pair.dont} />
        </div>
      ))}
    </div>
  )
}
