import { useId, type ComponentProps, type ReactNode } from 'react'
import { cx } from '../internal/cx.ts'
import { AlertMark, ChevronDownMark } from '../internal/icons.tsx'

interface FieldFrameProps {
  /** The field’s name, always visible above it. Placeholders are examples, never labels. */
  label: ReactNode
  /** Help shown under the field and read after the label. */
  description?: ReactNode
  /** What is wrong and how to fix it. When present, the field is marked invalid. */
  error?: ReactNode
  /**
   * Height of the field: medium (48 px) in forms, small (36 px) inside rows and panels, such as a quantity in a list.
   * @default 'medium'
   */
  size?: 'small' | 'medium'
  /** Icon at the start of the control, such as a search glass. */
  icon?: ReactNode
}

export interface TextFieldProps extends FieldFrameProps, Omit<ComponentProps<'input'>, 'size'> {
  /** A unit after the value, inside the field, such as plt; it is read after the value. */
  suffix?: ReactNode
}

export interface SelectFieldProps extends FieldFrameProps, Omit<ComponentProps<'select'>, 'size'> {
  /** The `<option>` and `<optgroup>` elements. */
  children: ReactNode
}

/** Ids that tie the label, the help and the error to the control. */
function useFieldIds(id: string | undefined, description: ReactNode, error: ReactNode) {
  const fallback = useId()
  const control = id ?? fallback
  const describedBy = [description && `${control}-description`, error && `${control}-error`].filter(Boolean).join(' ') || undefined
  return { control, describedBy }
}

function FieldFrame({
  label,
  description,
  error,
  size = 'medium',
  icon,
  control,
  className,
  children,
  trailing,
}: FieldFrameProps & { control: string; className?: string | undefined; children: ReactNode; trailing?: ReactNode }) {
  return (
    <div className={cx('sonar-field', className)} data-size={size} data-invalid={error ? true : undefined}>
      <label className="sonar-field-label" htmlFor={control}>
        {label}
      </label>
      <div className="sonar-field-control">
        {icon && (
          <span className="sonar-field-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
        {trailing}
      </div>
      {description && (
        <p className="sonar-field-description" id={`${control}-description`}>
          {description}
        </p>
      )}
      {error && (
        <p className="sonar-field-error" id={`${control}-error`}>
          <AlertMark className="sonar-field-error-icon" />
          {error}
        </p>
      )}
    </div>
  )
}

/** A native text input with its label, help and error. Any input type that takes text: text, search, email, number… */
export function TextField({ label, description, error, size, icon, suffix, id, className, ...props }: TextFieldProps) {
  const { control, describedBy } = useFieldIds(id, description, error)
  const described = [suffix ? `${control}-suffix` : '', describedBy ?? ''].filter(Boolean).join(' ') || undefined
  return (
    <FieldFrame
      label={label}
      description={description}
      error={error}
      size={size}
      icon={icon}
      control={control}
      className={className}
      trailing={
        suffix ? (
          <span className="sonar-field-suffix" id={`${control}-suffix`}>
            {suffix}
          </span>
        ) : undefined
      }
    >
      <input id={control} className="sonar-field-input" aria-describedby={described} aria-invalid={error ? true : undefined} {...props} />
    </FieldFrame>
  )
}

/**
 * A native select with its label, help and error. The list is the platform’s own: the best picker on phones and
 * full keyboard and screen reader support everywhere.
 */
export function SelectField({ label, description, error, size, icon, id, className, children, ...props }: SelectFieldProps) {
  const { control, describedBy } = useFieldIds(id, description, error)
  return (
    <FieldFrame
      label={label}
      description={description}
      error={error}
      size={size}
      icon={icon}
      control={control}
      className={className}
      trailing={<ChevronDownMark className="sonar-field-chevron" />}
    >
      <select id={control} className="sonar-field-input" aria-describedby={describedBy} aria-invalid={error ? true : undefined} {...props}>
        {children}
      </select>
    </FieldFrame>
  )
}
