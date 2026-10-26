import type { ComponentProps, ReactNode } from 'react'
import { cx } from '../internal/cx.ts'

export interface StatusProps extends ComponentProps<'span'> {
  /**
   * What the state means. Color never carries it alone: the text always names it.
   * @default 'neutral'
   */
  tone?: 'neutral' | 'positive' | 'warning' | 'danger'
  /**
   * A dot beside the text, for rows and lists; or a chip, for headers and for containers, where colored text
   * would not reach 4.5:1.
   * @default 'dot'
   */
  appearance?: 'dot' | 'chip'
  /**
   * Only the dot shows; the state stays in the text for assistive technology. For dense rows where a tooltip or the
   * row’s details name the state, as in the overview’s calendars.
   * @default false
   */
  hideLabel?: boolean
  /** The state in words: Delivered, Delayed, Due today. */
  children: ReactNode
}

/** The state of an order, a delivery or an invoice. */
export function Status({ tone = 'neutral', appearance = 'dot', hideLabel = false, className, children, ...props }: StatusProps) {
  return (
    <span className={cx('sonar-status', className)} data-tone={tone} data-appearance={appearance} data-label={hideLabel ? 'hidden' : undefined} {...props}>
      <span className="sonar-status-dot" aria-hidden="true" />
      {hideLabel ? <span className="sonar-status-label">{children}</span> : children}
    </span>
  )
}
