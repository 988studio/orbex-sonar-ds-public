import { Autocomplete } from '@base-ui/react/autocomplete'
import { useId, useRef, useState, type ReactNode } from 'react'
import { cx } from '../internal/cx.ts'
import { CloseMark, SearchMark } from '../internal/icons.tsx'

/*
 * SearchField: a search box whose results open under it as people type. Base UI’s Autocomplete provides the
 * behavior: the input is a combobox, arrow keys move through the results while focus stays in the field, Enter
 * chooses, Escape clears and then closes, and the list keeps away from the window edges. The search itself is the
 * app’s: it passes the results for the current text, and a status line that says how the text was read.
 * 1.1: the top-bar look of the product (variant), the first result highlighted whenever the list opens or changes,
 * Escape that clears before it closes, a status icon slot, and hooks to place and size the results (popupClassName,
 * align, popupWidth).
 */

export interface SearchFieldProps<Item> {
  /** What is searched, read by assistive technology: “Search orders, deliveries and invoices”. */
  label: string
  /**
   * Whether the label is drawn above the field. In a top bar the icon and the placeholder say what it is.
   * @default false
   */
  showLabel?: boolean
  /** An example of what to type, never a label. */
  placeholder?: string
  /** The text in the field. The field is always controlled. */
  value: string
  /** Called with the new text as people type or clear the field; not when a result is chosen. */
  onValueChange: (value: string) => void
  /** The results for the current text, or suggestions while the field is empty. */
  items: Item[]
  /** The text of an item: its key, and what is announced when it is highlighted. */
  itemToString: (item: Item) => string
  /** Draws one result, usually as a SearchResult. */
  renderItem: (item: Item) => ReactNode
  /**
   * Called when a result is chosen, by click or with Enter. Return true to keep the list open with the field
   * focused, as when a suggestion fills the field with its text.
   */
  onItemChoose: (item: Item) => boolean | void
  /** A line at the top of the list, announced politely: how the text was read, or that the search is running. */
  status?: ReactNode
  /**
   * While the results are on their way: the field says so and the list keeps the previous results out of reach.
   * @default false
   */
  busy?: boolean
  /** Shown when the text has no results. */
  empty?: ReactNode
  /** Icon shown while busy, instead of the magnifier. */
  busyIcon?: ReactNode
  /**
   * Medium in a top bar; small inside a card or a panel.
   * @default 'medium'
   */
  size?: 'small' | 'medium'
  /** Classes added to the field’s wrapper, after sonar-search. */
  className?: string
  /**
   * `field`: the outlined box. `top-bar`: the product’s top-bar search (v38): no box of its own, it fills the app
   * bar’s search pill (39 px), with a 22 px icon, 12 px text and an 18 px clear mark. On touch screens its text is
   * 16 px drawn at three quarters, so it looks the same and iOS does not zoom in.
   * @default 'field'
   * @since 1.1.0
   */
  variant?: 'field' | 'top-bar'
  /** Replaces the magnifier, such as the app’s own icon font glyph. @since 1.1.0 */
  icon?: ReactNode
  /** Replaces the clear mark. @since 1.1.0 */
  clearIcon?: ReactNode
  /** Drawn before the status line as the 28 px accent circle: what reads the text (an AI sparkle). @since 1.1.0 */
  statusIcon?: ReactNode
  /** Classes added to the results popup, to place or size it from the app. @since 1.1.0 */
  popupClassName?: string
  /**
   * Where the results line up with the field.
   * @default 'start'
   * @since 1.1.0
   */
  align?: 'start' | 'center' | 'end'
  /**
   * Width of the results: `anchor` is the field’s width, `auto` the field’s width but at least 320 px, or any CSS
   * length (`calc(100vw - 24px)`).
   * @default 'auto'
   * @since 1.1.0
   */
  popupWidth?: 'auto' | 'anchor' | string
}

/** A search field with its results in a list under it. */
export function SearchField<Item>({
  label,
  showLabel = false,
  placeholder,
  value,
  onValueChange,
  items,
  itemToString,
  renderItem,
  onItemChoose,
  status,
  busy = false,
  empty,
  busyIcon,
  size = 'medium',
  className,
  variant = 'field',
  icon,
  clearIcon,
  statusIcon,
  popupClassName,
  align = 'start',
  popupWidth = 'auto',
}: SearchFieldProps<Item>) {
  const [open, setOpen] = useState(false)
  const keep = useRef(false)
  const id = useId()
  const shown = busy ? [] : items
  const width = popupWidth === 'auto' ? undefined : popupWidth === 'anchor' ? 'var(--anchor-width)' : popupWidth
  return (
    <Autocomplete.Root
      items={shown}
      value={value}
      open={open}
      onOpenChange={(next, details) => {
        /* A chosen item that asks to keep searching leaves the list open */
        if (!next && details.reason === 'item-press' && keep.current) {
          keep.current = false
          return
        }
        setOpen(next)
      }}
      onValueChange={(next, details) => {
        if (details.reason === 'item-press') {
          const item = items.find((candidate) => itemToString(candidate) === next)
          keep.current = item !== undefined && onItemChoose(item) === true
          return
        }
        onValueChange(next)
      }}
      itemToStringValue={itemToString}
      filter={null}
      openOnInputClick
      autoHighlight="always"
    >
      <div
        className={cx('sonar-search', className)}
        data-size={size}
        data-variant={variant === 'top-bar' ? variant : undefined}
        data-busy={busy || undefined}
        onKeyDownCapture={(event) => {
          /* Escape clears the text first and keeps the list (now the suggestions); a second Escape closes it */
          if (event.key === 'Escape' && value) {
            event.preventDefault()
            event.stopPropagation()
            onValueChange('')
          }
        }}
      >
        {/* The input carries its name itself: while the list is open, Base UI hides the rest of the page from
            assistive technology, and a wrapping label would be hidden with it */}
        {showLabel && (
          <label className="sonar-search-label" htmlFor={id} aria-hidden="true">
            {label}
          </label>
        )}
        <Autocomplete.InputGroup className="sonar-search-control">
          <span className="sonar-search-icon" aria-hidden="true">
            {busy && busyIcon ? busyIcon : (icon ?? <SearchMark />)}
          </span>
          <Autocomplete.Input id={id} className="sonar-search-input" placeholder={placeholder} aria-label={label} aria-busy={busy || undefined} />
          {value && (
            <Autocomplete.Clear className="sonar-search-clear" aria-label="Clear search">
              {clearIcon ?? <CloseMark />}
            </Autocomplete.Clear>
          )}
        </Autocomplete.InputGroup>
      </div>
      <Autocomplete.Portal>
        {/* The top-bar look is fixed to the window: its bar may stick to the top of a page that scrolls (an app whose
            shell is the page), where results placed in the page drifted from the field while it scrolled and the
            highlighted result scrolled the page to reach them (1.1, prototype round 2) */}
        <Autocomplete.Positioner className="sonar-search-positioner" sideOffset={6} align={align} positionMethod={variant === 'top-bar' ? 'fixed' : 'absolute'}>
          <Autocomplete.Popup className={cx('sonar-search-popup', popupClassName)} aria-busy={busy || undefined} style={width ? { width } : undefined}>
            <Autocomplete.Status className="sonar-search-status">
              {status && statusIcon && (
                <span className="sonar-search-status-icon" aria-hidden="true">
                  {statusIcon}
                </span>
              )}
              {status}
            </Autocomplete.Status>
            {!busy && empty && (
              <Autocomplete.Empty className="sonar-search-empty">{empty}</Autocomplete.Empty>
            )}
            <Autocomplete.List className="sonar-search-list">
              {(item: Item) => (
                <Autocomplete.Item key={itemToString(item)} value={item} className="sonar-search-item">
                  {renderItem(item)}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  )
}

export interface SearchResultProps {
  /** What kind of thing it is, as an icon: a truck for a delivery, a receipt for an invoice. */
  icon?: ReactNode
  /** The result itself, on one line: a code and its key figure, such as “04-127C 12 items · 6 plt”. */
  title: ReactNode
  /** A second line: the kind of result and when it is. */
  description?: ReactNode
  /** At the end of the row, such as a Status dot. */
  trailing?: ReactNode
}

/** One row of results: an icon, a title, a line under it and something at the end. */
export function SearchResult({ icon, title, description, trailing }: SearchResultProps) {
  return (
    <>
      {icon && (
        <span className="sonar-search-result-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="sonar-search-result-text">
        <span className="sonar-search-result-title">{title}</span>
        {description && <span className="sonar-search-result-description">{description}</span>}
      </span>
      {trailing && <span className="sonar-search-result-trailing">{trailing}</span>}
    </>
  )
}
