/* Search in plain words: the app reads the text and passes the results; SearchField shows them as people type */
import { SearchField, SearchResult } from '@orbex/sonar-components/search'
import { Status } from '@orbex/sonar-components/status'
import '@orbex/sonar-components/search.css'
import '@orbex/sonar-components/status.css'
import { useEffect, useState } from 'react'

type Tone = 'neutral' | 'positive' | 'warning' | 'danger'
interface Item {
  id: string
  kind: 'Delivery' | 'Invoice'
  day: string
  text: string
  status: string
  tone: Tone
}

const items: Item[] = [
  { id: '04-127C', kind: 'Delivery', day: 'Tue May 12', text: '04-127C 1 item · 15 plt', status: 'Delayed', tone: 'warning' },
  { id: '04-121A', kind: 'Delivery', day: 'Tue May 12', text: '04-121A 7 items · 150 plt', status: 'Delayed', tone: 'warning' },
  { id: '04-133B', kind: 'Delivery', day: 'Wed May 13', text: '04-133B 3 items · 60 plt', status: 'Scheduled', tone: 'neutral' },
  { id: 'INV-7712', kind: 'Invoice', day: 'Tue May 12', text: 'INV-7712 · 30,000 USD', status: 'Due today', tone: 'warning' },
  { id: 'INV-7716', kind: 'Invoice', day: 'Tue May 12', text: 'INV-7716 · 16,800 USD', status: 'Paid', tone: 'positive' },
]

/* The app’s own reading of the text: here, a kind, a state and a code */
function search(text: string) {
  const query = text.toLowerCase()
  const kind = /deliver/.test(query) ? 'Delivery' : /invoice/.test(query) ? 'Invoice' : null
  const late = /late|delay|overdue/.test(query)
  const words = query.split(/\s+/).filter((word) => /\d/.test(word))
  return items.filter(
    (item) =>
      (!kind || item.kind === kind) &&
      (!late || ['Delayed', 'Overdue'].includes(item.status)) &&
      words.every((word) => item.id.toLowerCase().includes(word)),
  )
}

export function SmartSearch({ onOpen }: { onOpen: (item: Item) => void }) {
  const [value, setValue] = useState('')
  const [results, setResults] = useState<Item[]>([])
  const [busy, setBusy] = useState(false)

  /* Search after a short pause in typing, not on every key */
  useEffect(() => {
    if (!value.trim()) return setResults([])
    setBusy(true)
    const timer = setTimeout(() => {
      setResults(search(value))
      setBusy(false)
    }, 380)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <SearchField
      label="Search orders, deliveries and invoices"
      placeholder="Search…"
      value={value}
      onValueChange={setValue}
      items={results}
      itemToString={(item) => item.id}
      renderItem={(item) => (
        <SearchResult title={item.text} description={`${item.kind} · ${item.day}`} trailing={<Status tone={item.tone}>{item.status}</Status>} />
      )}
      onItemChoose={(item) => {
        setValue('')
        onOpen(item)
      }}
      status={busy ? `Understanding “${value}”…` : `${results.length} results for “${value}”`}
      busy={busy}
      empty="No results. Try “late deliveries” or “INV-77”."
    />
  )
}
