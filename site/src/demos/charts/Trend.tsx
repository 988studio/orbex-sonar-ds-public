/* A month day by day, with its running total: daily shipments in April */
import { TrendChart } from '@orbex/sonar-components/trend-chart'
import '@orbex/sonar-components/trend-chart.css'

const shipped = [
  355, 375, 310, 510, 405, 430, 325, 305, 300, 285, 405, 455, 370, 295, 350, 445, 450, 395, 365, 335, 310, 360, 345, 285,
  485, 360, 365, 340, 330, 375,
]
const days = shipped.map((_, index) => `Apr ${index + 1}`)
const total = shipped.reduce((sum, value) => sum + value, 0)

export default function Trend() {
  return (
    <div style={{ width: 'min(100%, 560px)' }}>
      <TrendChart
        label={`Daily shipments in April, ${total.toLocaleString('en-US')} pallets in total`}
        categories={days}
        series={{ name: 'Shipments (plt)', values: shipped }}
        cumulative={{ name: 'Cumulative (plt)' }}
        unit="plt"
        axisLabels={[0, 14, days.length - 1]}
      />
    </div>
  )
}
