import { useCallback, useId, type ComponentProps, type ReactNode, type Ref } from 'react'
import { cx } from '../internal/cx.ts'
import { CheckMark, DashMark } from '../internal/icons.tsx'

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  /** What is being chosen. */
  label: ReactNode
  /** One line of help, read after the label. */
  description?: ReactNode
  /**
   * Shown as a dash: some, not all, of the items it governs are checked. Clicking it checks it.
   * @default false
   */
  indeterminate?: boolean
}

/** A native checkbox, for choices that are submitted with a form or confirmed later. */
export function Checkbox({ label, description, indeterminate = false, className, id, ref, ...props }: CheckboxProps) {
  const fallbackId = useId()
  const inputId = id ?? fallbackId
  const descriptionId = description ? `${inputId}-description` : undefined
  /* indeterminate exists only as a DOM property, so it is set on the element itself */
  const setInput = useCallback(
    (input: HTMLInputElement | null) => {
      if (input) input.indeterminate = indeterminate
      assignRef(ref, input)
    },
    [indeterminate, ref],
  )
  return (
    <div className={cx('sonar-checkbox', className)}>
      <label className="sonar-checkbox-main" htmlFor={inputId}>
        <input ref={setInput} type="checkbox" id={inputId} className="sonar-checkbox-input" aria-describedby={descriptionId} {...props} />
        <span className="sonar-checkbox-box" aria-hidden="true">
          <CheckMark className="sonar-checkbox-check" />
          <DashMark className="sonar-checkbox-dash" />
        </span>
        <span className="sonar-checkbox-label">{label}</span>
      </label>
      {/* Outside the label, so it describes the checkbox without becoming part of its name */}
      {description && (
        <span className="sonar-checkbox-description" id={descriptionId}>
          {description}
        </span>
      )}
    </div>
  )
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}
