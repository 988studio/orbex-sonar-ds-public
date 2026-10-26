import { ChartLegend } from '@orbex/sonar-components/chart-legend'
import { RingChart } from '@orbex/sonar-components/ring-chart'

const inventory = [
  { value: 840, tone: 'danger', label: 'On hold' },
  { value: 1960, tone: 'muted', label: 'Available' },
] as const

const orders = [
  { value: 1420, tone: 'accent', label: 'Shipped' },
  { value: 80, tone: 'strong', label: 'On hold' },
  { value: 1100, tone: 'muted', label: 'Pending' },
] as const

const plt = (value: number) => `${value.toLocaleString('en-US')} plt`

export default function Rings() {
  return (
    <div className="chart-demo" data-shape="rings">
      <figure>
        <figcaption>Inventory</figcaption>
        <RingChart label="Inventory" format={plt} style={{ width: 128 }} segments={[...inventory]} />
        <ChartLegend aria-hidden="true" items={inventory.map(({ label, tone }) => ({ label, tone }))} />
      </figure>
      <figure>
        <figcaption>May orders</figcaption>
        <RingChart label="May orders" format={plt} style={{ width: 160 }} segments={[...orders]}>
          <span className="ring-total">
            <strong>2,600</strong>
            <span>plt</span>
          </span>
        </RingChart>
        <ChartLegend aria-hidden="true" items={orders.map(({ label, tone }) => ({ label, tone }))} />
      </figure>
    </div>
  )
}
