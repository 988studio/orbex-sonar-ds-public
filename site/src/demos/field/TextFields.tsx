import { TextField } from '@orbex/sonar-components/field'
import { SearchIcon } from '../icons.tsx'

export default function TextFields() {
  return (
    <>
      <TextField label="Product" placeholder="Name or code" />
      <TextField label="Quantity" type="number" inputMode="numeric" defaultValue="40" description="In pallets. Up to 120 per order." />
      <TextField label="Delivery date" defaultValue="May 3" error="Choose a date from May 12 on: earlier days are closed." />
      <TextField label="Search orders" type="search" icon={<SearchIcon />} placeholder="Order, product or carrier" />
      <TextField label="Account" defaultValue="Northwind Foods" disabled />
    </>
  )
}
