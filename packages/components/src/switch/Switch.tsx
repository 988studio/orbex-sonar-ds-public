import { useId, type ComponentProps, type ReactNode } from 'react'
import { cx } from '../internal/cx.ts'

export interface SwitchProps extends Omit<ComponentProps<'input'>, 'type' | 'role'> {
  /** What the switch turns on. */
  label: ReactNode
  /** One line on the effect, read after the label. */
  description?: ReactNode
}

/**
 * A native checkbox with the switch role: it works without JavaScript, in forms and with every assistive technology.
 * Use it for settings that apply at once; for a choice that is submitted later, use Checkbox.
 */
export function Switch({ label, description, className, id, ...props }: SwitchProps) {
  const fallbackId = useId()
  const inputId = id ?? fallbackId
  const descriptionId = description ? `${inputId}-description` : undefined
  return (
    <div className={cx('sonar-switch', className)}>
      <label className="sonar-switch-main" htmlFor={inputId}>
        <input type="checkbox" role="switch" id={inputId} className="sonar-switch-input" aria-describedby={descriptionId} {...props} />
        <span className="sonar-switch-track" aria-hidden="true" />
        <span className="sonar-switch-label">{label}</span>
      </label>
      {/* Outside the label, so it describes the switch without becoming part of its name */}
      {description && (
        <span className="sonar-switch-description" id={descriptionId}>
          {description}
        </span>
      )}
    </div>
  )
}
