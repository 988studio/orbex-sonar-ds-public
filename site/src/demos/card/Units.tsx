import { UnitMenu } from '@orbex/sonar-components/card'
import { useState } from 'react'

const units = [
  { value: 'plt', short: 'plt', name: 'Pallets' },
  { value: 'kg', short: 'kg', name: 'Kilograms' },
  { value: 'items', short: 'items', name: 'Items' },
]
const perPallet: Record<string, number> = { plt: 1, kg: 420, items: 36 }

/* Changing the unit converts every figure the card shows */
export default function Units() {
  const [unit, setUnit] = useState('plt')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ font: 'var(--sonar-type-title-md)', fontVariantNumeric: 'tabular-nums' }}>
        {`${(2800 * perPallet[unit]!).toLocaleString('en-US')} ${unit}`}
      </span>
      <UnitMenu label="Unit" value={unit} options={units} onValueChange={setUnit} />
    </div>
  )
}
