import { SegmentedControl } from '@orbex/sonar-components/segmented-control'

export default function Units() {
  return (
    <SegmentedControl
      legend="Unit"
      defaultValue="plt"
      options={[
        { value: 'plt', label: 'Pallets' },
        { value: 'kg', label: 'Kilograms' },
        { value: 'items', label: 'Items' },
      ]}
    />
  )
}
