import { Checkbox } from '@orbex/sonar-components/checkbox'
import { useState } from 'react'

const deliveries = ['04-127C', '04-128A', '04-131B']

/* The parent checkbox shows a dash while some, not all, rows are chosen */
export default function SelectAll() {
  const [chosen, setChosen] = useState<string[]>(['04-127C'])
  const all = chosen.length === deliveries.length
  const toggle = (id: string) => setChosen((ids) => (ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id]))
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <Checkbox
        label="All deliveries"
        checked={all}
        indeterminate={chosen.length > 0 && !all}
        onChange={() => setChosen(all ? [] : deliveries)}
      />
      <div style={{ display: 'grid', gap: 10, paddingLeft: 28 }}>
        {deliveries.map((id) => (
          <Checkbox key={id} label={`Delivery ${id}`} checked={chosen.includes(id)} onChange={() => toggle(id)} />
        ))}
      </div>
    </div>
  )
}
