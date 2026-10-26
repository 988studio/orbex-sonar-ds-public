import type { ComponentProps, ReactNode } from 'react'
import { cx } from '../internal/cx.ts'

export interface ButtonProps extends ComponentProps<'button'> {
  /**
   * Visual weight. Filled for the one main action of a view, tonal for secondary actions, outlined and text for the
   * rest.
   * @default 'filled'
   */
  variant?: 'filled' | 'tonal' | 'outlined' | 'text'
  /**
   * Medium in forms, panels and dialogs; small in cards and toolbars.
   * @default 'medium'
   */
  size?: 'small' | 'medium'
  /** Icon before the label. It is decorative: the label names the action. */
  icon?: ReactNode
  /** Icon after the label, such as a chevron on a button that opens a menu. */
  iconEnd?: ReactNode
}

/**
 * A native button. For navigation, use a link with the same class and data attributes instead:
 * `<a class="sonar-button" data-variant="tonal" data-size="medium" href="…">`.
 */
export function Button({ variant = 'filled', size = 'medium', icon, iconEnd, type = 'button', className, children, ...props }: ButtonProps) {
  return (
    <button type={type} className={cx('sonar-button', className)} data-variant={variant} data-size={size} {...props}>
      {icon && (
        <span className="sonar-button-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
      {iconEnd && (
        <span className="sonar-button-icon" aria-hidden="true">
          {iconEnd}
        </span>
      )}
    </button>
  )
}
