import { Menu as BaseMenu } from '@base-ui/react/menu'
import type { ReactNode } from 'react'
import { cx } from '../internal/cx.ts'
import { CheckMark } from '../internal/icons.tsx'

/*
 * Menu: a list of actions in a popup. Base UI provides the behavior (focus, typeahead, arrow keys, dismissal,
 * positioning that avoids the window edges); this module gives it the system’s look and a shorter anatomy:
 * Root, Trigger, Content, Item, Separator, Group, GroupLabel, RadioGroup and RadioItem.
 */

type ClassName = string | undefined

export type MenuRootProps = BaseMenu.Root.Props

export type MenuTriggerProps = BaseMenu.Trigger.Props

export interface MenuContentProps extends Omit<BaseMenu.Popup.Props, 'className'> {
  /** Classes added to the menu’s popup, after sonar-menu: a string, or a function of the menu’s state. */
  className?: ClassName
  /**
   * Side of the trigger the menu opens on. It flips when there is no room.
   * @default 'bottom'
   */
  side?: BaseMenu.Positioner.Props['side']
  /**
   * How the menu lines up with its trigger along that side: start, center or end. A menu in a card header aligns to
   * the end, so it opens inward.
   * @default 'start'
   */
  align?: BaseMenu.Positioner.Props['align']
  /**
   * Distance from the trigger, in pixels.
   * @default 6
   */
  sideOffset?: number
}

export interface MenuItemProps extends Omit<BaseMenu.Item.Props, 'className'> {
  /** Classes added to the item, after its own: a string, or a function of its state. */
  className?: ClassName
  /** Icon before the label. */
  icon?: ReactNode
  /** Text at the end of the row, such as a shortcut or a count. */
  trailing?: ReactNode
  /**
   * Danger for destructive actions: the label turns red, and the action should still be confirmed or undoable.
   * @default 'default'
   */
  tone?: 'default' | 'danger'
}

export interface MenuRadioItemProps extends Omit<BaseMenu.RadioItem.Props, 'className'> {
  /** Classes added to the radio item, after its own: a string, or a function of its state. */
  className?: ClassName
}

export interface MenuSeparatorProps extends Omit<BaseMenu.Separator.Props, 'className'> {
  /** Classes added to the separator, after its own: a string, or a function of its state. */
  className?: ClassName
}

export interface MenuGroupLabelProps extends Omit<BaseMenu.GroupLabel.Props, 'className'> {
  /** Classes added to the group label, after its own: a string, or a function of its state. */
  className?: ClassName
}

/** Holds the menu’s open state. */
function Root(props: MenuRootProps) {
  return <BaseMenu.Root {...props} />
}

/** The element that opens the menu. Pass a Button or an IconButton with `render`, so the trigger keeps its look. */
function Trigger(props: MenuTriggerProps) {
  return <BaseMenu.Trigger {...props} />
}

/** The popup, positioned against the trigger and rendered at the end of the document. */
function Content({ className, side = 'bottom', align = 'start', sideOffset = 6, children, ...props }: MenuContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner className="sonar-menu-positioner" side={side} align={align} sideOffset={sideOffset}>
        <BaseMenu.Popup className={cx('sonar-menu', className)} {...props}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}

/** An action. */
function Item({ className, icon, trailing, tone = 'default', children, ...props }: MenuItemProps) {
  return (
    <BaseMenu.Item className={cx('sonar-menu-item', className)} data-tone={tone} {...props}>
      {icon && (
        <span className="sonar-menu-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="sonar-menu-label">{children}</span>
      {trailing && <span className="sonar-menu-trailing">{trailing}</span>}
    </BaseMenu.Item>
  )
}

/** A rule between groups of items. */
function Separator({ className, ...props }: MenuSeparatorProps) {
  return <BaseMenu.Separator className={cx('sonar-menu-separator', className)} {...props} />
}

/** Items that belong together, named by a GroupLabel. */
function Group(props: BaseMenu.Group.Props) {
  return <BaseMenu.Group {...props} />
}

/** The name of a group, read when focus enters it. */
function GroupLabel({ className, ...props }: MenuGroupLabelProps) {
  return <BaseMenu.GroupLabel className={cx('sonar-menu-group-label', className)} {...props} />
}

/** A set of items where exactly one is chosen, such as the unit figures are shown in. */
function RadioGroup(props: BaseMenu.RadioGroup.Props) {
  return <BaseMenu.RadioGroup {...props} />
}

/** One choice in a RadioGroup, with a check when chosen. */
function RadioItem({ className, children, ...props }: MenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem className={cx('sonar-menu-item', className)} {...props}>
      <span className="sonar-menu-label">{children}</span>
      <BaseMenu.RadioItemIndicator className="sonar-menu-check">
        <CheckMark />
      </BaseMenu.RadioItemIndicator>
    </BaseMenu.RadioItem>
  )
}

export const Menu = { Root, Trigger, Content, Item, Separator, Group, GroupLabel, RadioGroup, RadioItem }
