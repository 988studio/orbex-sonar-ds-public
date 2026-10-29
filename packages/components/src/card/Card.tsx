import { useId, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { cx } from '../internal/cx.ts'
import { ArrowMark, ChevronDownMark } from '../internal/icons.tsx'
import { useScrollArea } from '../internal/scroll-area.ts'
import { Menu } from '../menu/Menu.tsx'

export interface CardProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** The card’s name, which also names the region for assistive technology. */
  title: ReactNode
  /**
   * Heading level of the title, to fit the page’s outline.
   * @default 'h2'
   */
  titleAs?: 'h2' | 'h3'
  /** Controls at the end of the header, such as a UnitMenu. */
  actions?: ReactNode
  /** The figure that sums the card up, under the title: a label and a value, such as Open total and 6,720 plt. */
  summary?: { label: ReactNode; value: ReactNode; tone?: 'accent' | 'default' }
  /** The way out of the card, usually a CardLink to the full page. */
  footer?: ReactNode
  /**
   * Height in the overview grid: S, M, L or XL from the layout tokens. The header and footer stay put; content that
   * does not fit scrolls between them. Without a size the card takes the height of its content.
   */
  size?: 's' | 'm' | 'l' | 'xl'
  /**
   * The region’s accessible name, when the title alone would repeat on the page: the same card shown twice, as in
   * “Orders, size S” and “Orders, size M”. By default the title names the region.
   */
  label?: string
}

/**
 * A card of the overview: a titled region with an optional summary figure, content and a way to the full page.
 * The card is a section named by its title, so the overview reads as a list of landmarks.
 */
export function Card({ title, titleAs: Title = 'h2', actions, summary, footer, size, label, className, children, ...props }: CardProps) {
  const titleId = useId()
  const body = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLSpanElement>(null)
  useScrollArea(body, thumb, size !== undefined)
  return (
    <section className={cx('sonar-card', className)} data-size={size} aria-labelledby={label ? undefined : titleId} aria-label={label} {...props}>
      <header className="sonar-card-header">
        <Title className="sonar-card-title" id={titleId}>
          {title}
        </Title>
        {actions && <div className="sonar-card-actions">{actions}</div>}
      </header>
      {summary && (
        <p className="sonar-card-summary">
          <span className="sonar-card-summary-label">{summary.label}</span>
          <span className="sonar-card-summary-value" data-tone={summary.tone ?? 'accent'}>
            {summary.value}
          </span>
        </p>
      )}
      <div ref={body} className="sonar-card-body" data-labelledby={titleId}>
        {children}
      </div>
      {size && <span ref={thumb} className="sonar-scroll-thumb" aria-hidden="true" hidden />}
      {footer && <footer className="sonar-card-footer">{footer}</footer>}
    </section>
  )
}

export interface CardScrollProps extends ComponentProps<'div'> {
  /** What the list is, read when it takes focus to scroll: “Deliveries of May 12”. */
  label: string
}

/**
 * The part of a card’s content that gives way first when the card’s size leaves no room, such as a list of
 * deliveries: it keeps its full height while it fits, and scrolls when it does not. The rest of the content stays in
 * place.
 */
export function CardScroll({ label, className, children, ...props }: CardScrollProps) {
  const area = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLSpanElement>(null)
  useScrollArea(area, thumb, true, 'snap')
  return (
    <div className={cx('sonar-card-scroll', className)} {...props}>
      <div ref={area} className="sonar-card-scroll-area" data-label={label}>
        {children}
      </div>
      <span ref={thumb} className="sonar-scroll-thumb" aria-hidden="true" hidden />
    </div>
  )
}

export interface CardLinkProps extends ComponentProps<'a'> {
  /** Where it goes, as a verb phrase: Go to Orders. */
  children: ReactNode
}

/** The link at the foot of a card to the page it summarizes, with the arrow in a filled circle. */
export function CardLink({ className, children, ...props }: CardLinkProps) {
  return (
    <a className={cx('sonar-card-link', className)} {...props}>
      {children}
      <span className="sonar-card-link-arrow" aria-hidden="true">
        <ArrowMark />
      </span>
    </a>
  )
}

export interface UnitMenuProps {
  /** What the unit measures, read with the current value: “Unit: plt, Pallets”. */
  label: string
  /** The value of the unit shown, one of the options' values. The menu is always controlled. */
  value: string
  /** The units to choose from: a short code, shown in caps on the pill and in the menu, and the full name, read with it. */
  options: { value: string; short: string; name: string }[]
  /** Called with the value of the unit chosen. The card converts its figures; the menu closes on its own. */
  onValueChange: (value: string) => void
}

/**
 * The unit a card’s figures are shown in, as a small pill that opens a menu. Changing it converts every figure in
 * the card; it is the card’s only setting.
 */
export function UnitMenu({ label, value, options, onValueChange }: UnitMenuProps) {
  const current = options.find((option) => option.value === value) ?? options[0]
  /* Pressed (1.1.6): the menu opens on press and takes the press away from :active, so the pill marks its own press
     and turns squarer while the pointer is down, as v38's pill and the approved videos do. */
  const [pressed, setPressed] = useState(false)
  return (
    <Menu.Root>
      {/* The name contains what the pill shows, so voice control can reach it by it: “Unit: plt, Pallets” */}
      <Menu.Trigger
        className="sonar-unit-menu"
        aria-label={`${label}: ${current?.short ?? value}, ${current?.name ?? value}`}
        data-pressing={pressed || undefined}
        onPointerDown={(event) => {
          if (event.button) return
          setPressed(true)
          const release = () => setPressed(false)
          window.addEventListener('pointerup', release, { once: true })
          window.addEventListener('pointercancel', release, { once: true })
        }}
      >
        {current?.short}
        <ChevronDownMark />
      </Menu.Trigger>
      {/* The units by their short names, in caps, as on the pill; the full name is read with each */}
      <Menu.Content align="end" sideOffset={7} className="sonar-unit-menu-popup" aria-label={label}>
        <Menu.RadioGroup value={value} onValueChange={(next) => onValueChange(String(next))}>
          {options.map((option) => (
            <Menu.RadioItem key={option.value} value={option.value} aria-label={`${option.short.toUpperCase()}, ${option.name}`}>
              {option.short.toUpperCase()}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  )
}
