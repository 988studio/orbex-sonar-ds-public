import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import type { ReactElement, ReactNode } from 'react'

export interface TooltipProps {
  /** The text shown. Short: a name or a hint, never something the person must read to continue. */
  content: ReactNode
  /** The element it describes, usually an IconButton. It must be focusable, so keyboard users get the tooltip too. */
  children: ReactElement
  /**
   * Side of the element the tooltip opens on. It flips when there is no room.
   * @default 'top'
   */
  side?: BaseTooltip.Positioner.Props['side']
  /**
   * Time the pointer rests on the trigger before the tooltip opens, in milliseconds. Keyboard focus opens it at once.
   * @default 300
   */
  delay?: number
}

/**
 * A short label on the inverse surface, shown on hover and focus. Wrap groups of triggers in TooltipProvider so
 * that, once one tooltip is open, moving to the next shows it without the delay.
 */
export function Tooltip({ content, children, side = 'top', delay = 300 }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger delay={delay} render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner className="sonar-tooltip-positioner" side={side} sideOffset={8}>
          <BaseTooltip.Popup className="sonar-tooltip">{content}</BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  )
}

export type TooltipProviderProps = BaseTooltip.Provider.Props

/** Shares the open delay between tooltips, so moving along a toolbar does not wait at every button. */
export function TooltipProvider(props: TooltipProviderProps) {
  return <BaseTooltip.Provider {...props} />
}
