import type { ComponentProps } from 'react'
import { cx } from '../internal/cx.ts'

export interface BadgeProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** The number to show. Without it, the badge is a dot that only signals something new. */
  count?: number
  /**
   * Counts above this show as `99+`.
   * @default 99
   */
  max?: number
  /**
   * What the badge means, read by assistive technology instead of the bare number, such as “3 unpaid invoices”.
   * Leave it out only when the element the badge sits on already says it.
   */
  label?: string
  /**
   * Danger for things that need attention; accent for news.
   * @default 'danger'
   */
  tone?: 'danger' | 'accent'
}

/** A small count or dot on a navigation item, an icon button or a tab. */
export function Badge({ count, max = 99, label, tone = 'danger', className, ...props }: BadgeProps) {
  const shown = count === undefined ? null : count > max ? `${max}+` : String(count)
  return (
    <span className={cx('sonar-badge', className)} data-tone={tone} data-dot={shown === null || undefined} {...props}>
      {shown !== null && <span aria-hidden={label ? true : undefined}>{shown}</span>}
      {label && <span className="sonar-badge-label">{label}</span>}
    </span>
  )
}
