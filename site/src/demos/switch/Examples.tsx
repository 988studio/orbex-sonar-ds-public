import { Switch } from '@orbex/sonar-components/switch'

export default function Examples() {
  return (
    <>
      <Switch label="Daily shipments" defaultChecked />
      <Switch label="Compact figures" description="Shows 1.96K instead of 1,960 where space is short." />
      <Switch label="Recurring orders" disabled />
    </>
  )
}
