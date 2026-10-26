/* Balance, size M: the balance, its overdue share as a tick bar, and the invoices due today */
import { Card, CardLink, UnitMenu } from '@orbex/sonar-components/card'
import { ChartLegend } from '@orbex/sonar-components/chart-legend'
import { Status } from '@orbex/sonar-components/status'
import { TickBar } from '@orbex/sonar-components/tick-bar'
import '@orbex/sonar-components/card.css'
import '@orbex/sonar-components/chart-legend.css'
import '@orbex/sonar-components/menu.css'
import '@orbex/sonar-components/status.css'
import '@orbex/sonar-components/tick-bar.css'
import { useState } from 'react'

const currencies = [
  { value: 'USD', short: 'USD', name: 'US dollars' },
  { value: 'EUR', short: 'EUR', name: 'Euros' },
]
const perDollar: Record<string, number> = { USD: 1, EUR: 0.92 }
const balance = { total: 3_900_000, overdue: 2_230_800 }
/* The invoices due today */
const today = [
  { id: 'INV-7712', amount: 30_000, status: 'Due today', tone: 'warning' },
  { id: 'INV-7716', amount: 16_800, status: 'Paid', tone: 'positive' },
] as const

export function BalanceCard() {
  const [currency, setCurrency] = useState('USD')
  const format = (dollars: number) => `${Math.round(dollars * perDollar[currency]!).toLocaleString('en-US')} ${currency}`
  const parts = [
    { label: 'Overdue', tone: 'danger', value: balance.overdue },
    { label: 'Not due yet', tone: 'muted', value: balance.total - balance.overdue },
  ] as const
  return (
    <Card
      title="Balance"
      size="m"
      actions={<UnitMenu label="Currency" value={currency} options={currencies} onValueChange={setCurrency} />}
      summary={{ label: 'Balance', value: format(balance.total) }}
      footer={<CardLink href="/balance">Go to Balance</CardLink>}
    >
      <TickBar label="Overdue share of the balance" format={format} segments={[...parts]} />
      <ChartLegend items={parts.map(({ label, tone, value }) => ({ label, tone, value: format(value) }))} aria-hidden="true" />
      <ul role="list" style={{ display: 'grid', gap: 8, marginTop: 16, padding: 0 }}>
        {today.map(({ id, amount, tone, status }) => (
          <li key={id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span>{id}</span>
            <span>{format(amount)}</span>
            <Status tone={tone}>{status}</Status>
          </li>
        ))}
      </ul>
    </Card>
  )
}
