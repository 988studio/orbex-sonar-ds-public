import { Checkbox } from '@orbex/sonar-components/checkbox'

export default function Examples() {
  return (
    <>
      <Checkbox label="Include delivered" defaultChecked />
      <Checkbox label="Notify the carrier" description="An email with the new delivery window." />
      <Checkbox label="Split by warehouse" disabled />
    </>
  )
}
