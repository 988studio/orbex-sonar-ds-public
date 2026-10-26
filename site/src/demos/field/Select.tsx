import { SelectField } from '@orbex/sonar-components/field'

export default function Select() {
  return (
    <>
      <SelectField label="Warehouse" defaultValue="north">
        <option value="north">North · Valencia</option>
        <option value="south">South · Seville</option>
        <option value="central">Central · Madrid</option>
      </SelectField>
      <SelectField label="Carrier" size="small" defaultValue="">
        <option value="" disabled>
          Choose a carrier
        </option>
        <option>Iberia Freight</option>
        <option>Atlas Logistics</option>
      </SelectField>
    </>
  )
}
