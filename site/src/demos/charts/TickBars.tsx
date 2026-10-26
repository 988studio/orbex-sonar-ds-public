import { ChartLegend } from '@orbex/sonar-components/chart-legend'
import { TickBar } from '@orbex/sonar-components/tick-bar'

const orders = [
  { value: 1420, tone: 'accent', label: 'Shipped' },
  { value: 80, tone: 'strong', label: 'On hold' },
  { value: 1100, tone: 'muted', label: 'Pending' },
] as const

const balance = [
  { value: 2_230_800, tone: 'danger', label: 'Overdue' },
  { value: 1_669_200, tone: 'muted', label: 'Not due yet' },
] as const

const plt = (value: number) => `${value.toLocaleString('en-US')} plt`
const usd = (value: number) => `${value.toLocaleString('en-US')} USD`

export default function TickBars() {
  return (
    <div className="chart-demo" data-shape="bars">
      <figure>
        <figcaption>May orders</figcaption>
        <TickBar label="May orders" format={plt} segments={[...orders]} />
        <ChartLegend aria-hidden="true" items={orders.map(({ label, tone }) => ({ label, tone }))} />
      </figure>
      <figure>
        <figcaption>Overdue share of the balance</figcaption>
        <TickBar label="Overdue share of the balance" format={usd} segments={[...balance]} />
        <ChartLegend aria-hidden="true" items={balance.map(({ label, tone }) => ({ label, tone }))} />
      </figure>
    </div>
  )
}
