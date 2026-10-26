import type { ComponentProps, ReactNode } from 'react'
import { cx } from '../internal/cx.ts'

export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  /** What the button does, read by assistive technology. Pair the button with a Tooltip to show it on hover. */
  label: string
  /** The icon. Decorative: the label names the action. */
  icon: ReactNode
  /**
   * Standard sits on any surface with no fill; the others follow the weights of Button.
   * @default 'standard'
   */
  variant?: 'standard' | 'filled' | 'tonal' | 'outlined'
  /**
   * Medium is a 40 px button; small is 32 px, for card headers and dense rows. Both keep a 48 px touch target.
   * @default 'medium'
   */
  size?: 'small' | 'medium'
}

/** A round button that shows only an icon. */
export function IconButton({ label, icon, variant = 'standard', size = 'medium', type = 'button', className, ...props }: IconButtonProps) {
  return (
    <button type={type} aria-label={label} className={cx('sonar-icon-button', className)} data-variant={variant} data-size={size} {...props}>
      <span className="sonar-icon-button-icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  )
}
