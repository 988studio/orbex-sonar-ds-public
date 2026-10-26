import { useId, type ComponentProps, type ReactNode } from 'react'
import { cx } from '../internal/cx.ts'

export interface SegmentedOption {
  value: string
  /** The option’s name. With `iconOnly`, it is read by assistive technology and not drawn. */
  label: string
  icon?: ReactNode
}

export interface SegmentedControlProps extends Omit<ComponentProps<'fieldset'>, 'onChange' | 'defaultValue'> {
  /** What is being chosen, such as “Unit”. Always present for assistive technology; drawn unless `hideLegend`. */
  legend: string
  /**
   * Hides the legend from view while keeping it for assistive technology, when the options explain themselves.
   * @default false
   */
  hideLegend?: boolean
  /** Two to five options. More than that is a select. */
  options: SegmentedOption[]
  /** Shared by the radios, so the choice is submitted with a form. A unique name is made when it is left out. */
  name?: string
  /** The chosen value, for a controlled control. */
  value?: string
  /** The value chosen at first, for an uncontrolled control. */
  defaultValue?: string
  /** Called with the new value when the choice changes. */
  onValueChange?: (value: string) => void
  /**
   * Show icons only. Every option still needs a label.
   * @default false
   */
  iconOnly?: boolean
  /**
   * Medium for toolbars and forms; small inside a card header, beside its title.
   * @default 'medium'
   */
  size?: 'small' | 'medium'
}

/**
 * A choice of one among a few, drawn as a row of segments. Native radios underneath: arrow keys move the choice,
 * and the control works in forms without JavaScript.
 */
export function SegmentedControl({
  legend,
  hideLegend = false,
  options,
  name,
  value,
  defaultValue,
  onValueChange,
  iconOnly = false,
  size = 'medium',
  className,
  ...props
}: SegmentedControlProps) {
  const fallbackName = useId()
  const group = name ?? fallbackName
  return (
    <fieldset className={cx('sonar-segmented', className)} data-size={size} data-icon-only={iconOnly || undefined} {...props}>
      <legend className="sonar-segmented-legend" data-hidden={hideLegend || undefined}>
        {legend}
      </legend>
      <div className="sonar-segmented-track">
        {options.map((option) => (
          <label key={option.value} className="sonar-segmented-option">
            <input
              type="radio"
              className="sonar-segmented-input"
              name={group}
              value={option.value}
              {...(value === undefined ? { defaultChecked: option.value === defaultValue } : { checked: option.value === value })}
              onChange={(event) => onValueChange?.(event.currentTarget.value)}
            />
            {option.icon && (
              <span className="sonar-segmented-icon" aria-hidden="true">
                {option.icon}
              </span>
            )}
            <span className="sonar-segmented-label">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
