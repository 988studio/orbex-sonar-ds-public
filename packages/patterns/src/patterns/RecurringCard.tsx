import { Button } from '@orbex/sonar-components/button'
import { Card, CardLink, CardScroll } from '@orbex/sonar-components/card'
import { Checkbox } from '@orbex/sonar-components/checkbox'
import { Fragment, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { BoltFillIcon, BoxIcon, CartIcon, InfoIcon, InStockIcon, OutOfStockIcon, SwapIcon } from '../icons.tsx'
import { Sep } from './Calendar.tsx'
import { ReorderPanel, RollIcon } from './OrderPanels.tsx'
import { inUnit, withUnit } from './data.ts'
import { reducedMotion } from './motion.ts'
import './cards.css'

interface Product {
  code: string
  name: string
  pack: 'Box' | 'Roll' | 'Unit'
  /** In stock, in pallets */
  stock: number
}

const P = (code: string, name: string, pack: Product['pack'], stock: number): Product => ({ code, name, pack, stock })

/* The products ordered most often, with two suggestions from the market between them */
const LIST: (Product | { suggestion: string })[] = [
  P('CB-4030', 'Corrugated box / Double wall', 'Box', 380),
  { suggestion: 'new recycled-fiber boxes' },
  P('SF-2300', 'Stretch film 23 µm / SF-2300', 'Roll', 560),
  P('KP-1200', 'Kraft paper 120 g / KP-1200', 'Roll', 210),
  P('EP-5050', 'Edge protector 50×50 / EP-5050', 'Unit', 940),
  P('CB-2010', 'Corrugated box / Single wall', 'Box', 640),
  P('SF-1700', 'Stretch film 17 µm / SF-1700', 'Roll', 320),
  { suggestion: 'thinner film, same hold' },
  P('TS-1210', 'Pallet top sheet / TS-1210', 'Unit', 150),
  P('SB-1200', 'Strapping band 12 mm / SB-1200', 'Roll', 480),
]

/* SF-2300 runs out when it is chosen; SF-2000 is offered instead */
const SHORT = 'SF-2300'
const ALTERNATIVE = P('SF-2000', 'Stretch film 20 µm / SF-2000', 'Roll', 410)
const BACK = 'back May 24'

const Thumb = ({ pack }: { pack: Product['pack'] }) => <span className="recurring-well">{pack === 'Roll' ? <RollIcon /> : <BoxIcon />}</span>

/**
 * Recurring orders, in M, L or XL: the products ordered most often, to reorder in one step. The list scrolls between
 * the summary and the footer; a larger size shows more of it. A product chosen while out of stock offers an
 * alternative, and Reorder waits until it is swapped or unchosen. Reorder opens the review in a side panel.
 */
export default function RecurringCard({ size = 'l', label }: { size?: 'm' | 'l' | 'xl'; label?: string }) {
  const [chosen, setChosen] = useState(['CB-4030'])
  const [short, setShort] = useState(false)
  const [swapped, setSwapped] = useState(false)
  const [reordering, setReordering] = useState<{ name: string; code: string }[] | null>(null)
  const list = useRef<HTMLUListElement>(null)
  const products = LIST.map((entry) => ('code' in entry && entry.code === SHORT && swapped ? ALTERNATIVE : entry))

  const toggle = (code: string) => {
    const on = chosen.includes(code)
    setChosen(on ? chosen.filter((other) => other !== code) : [...chosen, code])
    /* Choosing it is when the shortage shows */
    if (code === SHORT) setShort(!on)
  }
  const swap = () => {
    setChosen(chosen.map((code) => (code === SHORT ? ALTERNATIVE.code : code)))
    setShort(false)
    setSwapped(true)
  }
  const blocked = chosen.length === 0 || (short && chosen.includes(SHORT))

  /* When the alternative opens or a product is swapped, the list brings it into view, after it has unfolded */
  const reveal = (selector: string, center: boolean) => {
    const target = list.current?.querySelector<HTMLElement>(selector)
    const area = target?.closest<HTMLElement>('.sonar-card-scroll-area')
    if (!target || !area) return
    const top = target.getBoundingClientRect().top - area.getBoundingClientRect().top + area.scrollTop
    const goal = center ? top - (area.clientHeight - target.offsetHeight) / 2 : top + target.offsetHeight - area.clientHeight + 8
    if (!center && goal <= area.scrollTop) return
    area.scrollTo({ top: Math.max(0, goal), behavior: reducedMotion() ? 'auto' : 'smooth' })
  }
  useLayoutEffect(() => {
    if (!short) return
    const timer = setTimeout(() => reveal('.recurring-alternative', false), 320)
    return () => clearTimeout(timer)
  }, [short])
  useLayoutEffect(() => {
    if (swapped) reveal('[data-swapped]', true)
  }, [swapped])

  const stock = (product: Product): ReactNode =>
    short && product.code === SHORT ? (
      <span className="recurring-stock" data-out>
        <OutOfStockIcon />
        <span>Out of stock</span>
        <Sep />
        <span className="recurring-eta">{BACK}</span>
      </span>
    ) : (
      <span className="recurring-stock">
        <InStockIcon />
        {`Stock: ${withUnit(inUnit(product.stock, 'plt'), 'plt')}`}
        {product.code === ALTERNATIVE.code && <span className="recurring-tag">Alternative</span>}
      </span>
    )

  return (
    <Card
      titleAs="h3"
      label={label}
      size={size}
      className="recurring-card"
      title={
        <>
          <span className="recurring-quick" aria-hidden="true">
            Quick action
          </span>
          Recurring orders<span className="visually-hidden">, quick action</span>
        </>
      }
      actions={<BoltFillIcon className="recurring-bolt" />}
      summary={{ label: 'Selected products', value: <span key={chosen.length} className="recurring-count">{chosen.length}</span>, tone: 'default' }}
      footer={
        <div className="card-footer-row">
          <CardLink href="/patterns/overview/#card-recurring">Go to Orbex Market</CardLink>
          <Button
            size="small"
            iconEnd={<CartIcon />}
            disabled={blocked}
            aria-haspopup="dialog"
            onClick={() => setReordering(products.filter((entry): entry is Product => 'code' in entry && chosen.includes(entry.code)).map(({ name, code }) => ({ name, code })))}
          >
            Reorder
          </Button>
        </div>
      }
    >
      <CardScroll label="Products to reorder">
        <ul ref={list} className="recurring-list" role="list">
          {products.map((entry, index) => {
            if ('suggestion' in entry) {
              return (
                <li key={entry.suggestion}>
                  {/* A suggestion from the market: a green bookmark and two lines on a pale band */}
                  <p className="recurring-banner">
                    <span className="recurring-bookmark" aria-hidden="true">
                      <InfoIcon />
                    </span>
                    <span>Take a look!</span>
                    <span>
                      <a href="/patterns/overview/#card-recurring">{entry.suggestion}</a>.
                    </span>
                  </p>
                </li>
              )
            }
            const product = entry
            return (
              <Fragment key={index}>
                <li className="recurring-product" data-out={(short && product.code === SHORT) || undefined} data-swapped={(product.code === ALTERNATIVE.code) || undefined}>
                  <Thumb pack={product.pack} />
                  <Checkbox
                    label={product.name}
                    description={
                      <>
                        <span className="recurring-pack">
                          <span>{`Packaging ${product.code}`}</span>
                          <Sep />
                          <span>{product.pack}</span>
                        </span>
                        {stock(product)}
                      </>
                    }
                    checked={chosen.includes(product.code)}
                    onChange={() => toggle(product.code)}
                  />
                </li>
                {product.code === SHORT && (
                  <li className="recurring-alternative-wrap" data-open={short || undefined} inert={!short || undefined}>
                    <div className="recurring-alternative-clip">
                      <div className="recurring-alternative">
                        <span className="recurring-well recurring-alternative-thumb" aria-hidden="true">
                          <RollIcon />
                          <span className="recurring-alternative-mark">
                            <SwapIcon />
                          </span>
                        </span>
                        <p>
                          <span className="card-meta">Try instead</span>
                          <br />
                          <strong>{ALTERNATIVE.code}</strong>
                          <Sep />
                          <span>{withUnit(inUnit(ALTERNATIVE.stock, 'plt'), 'plt')}</span>
                        </p>
                        <Button size="small" variant="outlined" className="recurring-swap" onClick={swap} aria-label={`Swap ${SHORT} for ${ALTERNATIVE.code}`}>
                          Swap
                        </Button>
                      </div>
                    </div>
                  </li>
                )}
              </Fragment>
            )
          })}
        </ul>
      </CardScroll>
      <ReorderPanel items={reordering} onClose={() => setReordering(null)} unit="plt" />
    </Card>
  )
}
