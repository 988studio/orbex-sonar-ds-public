import type { ComponentProps, ReactNode } from 'react'
import { cx } from '../internal/cx.ts'
import { AlertMark, InfoMark, SuccessMark } from '../internal/icons.tsx'

export interface NoticeProps extends Omit<ComponentProps<'div'>, 'title'> {
  /**
   * Info for news and tips, success for a finished task, warning for something to check, danger for a problem.
   * @default 'info'
   */
  tone?: 'info' | 'success' | 'warning' | 'danger'
  /** A few words in bold before the message. */
  title?: ReactNode
  /** The message, one or two sentences. */
  children: ReactNode
  /** One action at the end, such as a Button with `variant="text"`. */
  action?: ReactNode
}

const marks = { info: InfoMark, success: SuccessMark, warning: AlertMark, danger: AlertMark }

/**
 * A message inside the page, next to what it is about. It stays until the situation changes; for feedback on an
 * action that just happened, use a toast. Add `role="status"` or `role="alert"` when the notice appears while the
 * person is working, so it is announced.
 */
export function Notice({ tone = 'info', title, action, className, children, ...props }: NoticeProps) {
  const Mark = marks[tone]
  return (
    <div className={cx('sonar-notice', className)} data-tone={tone} {...props}>
      <Mark className="sonar-notice-icon" />
      <div className="sonar-notice-text">
        {title && <strong className="sonar-notice-title">{title}</strong>}
        {title && ' '}
        {children}
      </div>
      {action && <div className="sonar-notice-action">{action}</div>}
    </div>
  )
}
