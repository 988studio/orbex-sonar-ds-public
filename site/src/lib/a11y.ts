/**
 * Keyboard and ARIA of each component, as built. The component pages print these as tables under Accessibility;
 * the Accessibility page explains the system-wide commitments behind them. When a component changes how it is used
 * from the keyboard or what it exposes to assistive technology, this file changes with it.
 */
export interface A11y {
  /** Keys and what they do, in the order someone meets them */
  keyboard: [key: string, action: string][]
  /** Elements, roles and attributes, and what they give assistive technology */
  aria: [what: string, why: string][]
}

const activate: [string, string][] = [
  ['Tab', 'Moves focus to the control, and on.'],
  ['Enter or Space', 'Activates it.'],
]

export const a11y: Record<string, A11y> = {
  button: {
    keyboard: activate,
    aria: [
      ['<button type="button">', 'A native button: role, name and states come from the browser. It never submits a form unless asked to.'],
      ['disabled', 'Removes it from the tab order and tells assistive technology it is unavailable.'],
      ['Icons', 'aria-hidden: the label alone names the action.'],
    ],
  },
  'icon-button': {
    keyboard: activate,
    aria: [
      ['aria-label', 'From the required label prop: the button’s name, since it shows no text.'],
      ['Icon', 'aria-hidden.'],
    ],
  },
  badge: {
    keyboard: [['None', 'A badge is not interactive; the element it sits on takes focus.']],
    aria: [
      ['label', 'A visually hidden phrase read instead of the bare number: “3 unpaid invoices”.'],
      ['aria-hidden', 'For a badge whose meaning is already in its container’s name, such as an icon button named “Notifications, 12 unread”.'],
    ],
  },
  status: {
    keyboard: [['None', 'Status is text, not a control.']],
    aria: [
      ['Text', 'The state is always written, so it never depends on color.'],
      ['Dot', 'aria-hidden.'],
    ],
  },
  switch: {
    keyboard: [
      ['Tab', 'Moves focus to the switch.'],
      ['Space', 'Turns it on or off.'],
    ],
    aria: [
      ['<input type="checkbox" role="switch">', 'Announced as a switch, on or off; still a checkbox in forms and without JavaScript.'],
      ['<label>', 'Wraps the input, so the label names it and clicking the label toggles it.'],
      ['aria-describedby', 'Ties the help text to the input without adding it to the name.'],
    ],
  },
  checkbox: {
    keyboard: [
      ['Tab', 'Moves focus to the checkbox.'],
      ['Space', 'Checks or unchecks it.'],
    ],
    aria: [
      ['<input type="checkbox">', 'Native: checked, unchecked and, through the indeterminate property, mixed.'],
      ['<label>', 'Names the input and enlarges what can be clicked.'],
      ['aria-describedby', 'Ties the help text to the input.'],
    ],
  },
  'segmented-control': {
    keyboard: [
      ['Tab', 'Moves focus to the chosen option.'],
      ['Arrow keys', 'Move to the next or previous option and choose it.'],
      ['Space', 'Chooses the focused option.'],
    ],
    aria: [
      ['<fieldset> and <legend>', 'Group the options under one name, read when focus enters. A hidden legend is still read.'],
      ['<input type="radio">', 'One per option: announced as “2 of 3”, with the chosen one checked.'],
      ['Icons only', 'Each option keeps its label as text for assistive technology.'],
    ],
  },
  field: {
    keyboard: [
      ['Tab', 'Moves focus to the field.'],
      ['Arrow keys, Space, Enter', 'Open and move through a select’s options, with the platform’s own picker.'],
    ],
    aria: [
      ['<label for>', 'Names the input or select.'],
      ['aria-describedby', 'Points at the help and then the error, so both are read after the name.'],
      ['aria-invalid', 'Set while there is an error.'],
      ['Icon', 'aria-hidden.'],
    ],
  },
  notice: {
    keyboard: [['Tab', 'Reaches the notice’s action, when it has one; the notice itself does not take focus.']],
    aria: [
      ['No role by default', 'A notice present when the page loads is read in its place.'],
      ['role="status" or role="alert"', 'Added by the app when a notice appears while the page is in use, so it is announced: status politely, alert at once.'],
      ['Icon', 'aria-hidden: the tone is also in the words.'],
    ],
  },
  toast: {
    keyboard: [
      ['F6', 'Moves focus to the notifications region, from anywhere on the page.'],
      ['Tab', 'Moves to the toast’s action and its close button.'],
      ['Enter or Space', 'Activates the action, or dismisses the toast.'],
    ],
    aria: [
      ['role="region", aria-live="polite"', 'The viewport, named “Notifications”: a new toast is announced without interrupting.'],
      ['role="dialog"', 'Each toast, not modal, named by its message.'],
      ['Timers', 'Pause while the pointer or focus is in the region, so a message never disappears while it is being read. A toast with an action stays for 10 seconds.'],
    ],
  },
  menu: {
    keyboard: [
      ['Enter, Space or Down arrow', 'On the trigger: opens the menu and focuses the first item.'],
      ['Up and Down arrows', 'Move between items; disabled items are skipped.'],
      ['Home and End', 'Go to the first or the last item.'],
      ['A letter', 'Moves to the next item that starts with it.'],
      ['Enter or Space', 'Activates the item, or chooses it in a group of choices.'],
      ['Escape', 'Closes the menu and returns focus to the trigger.'],
      ['Tab', 'Closes the menu and moves on.'],
    ],
    aria: [
      ['aria-haspopup, aria-expanded', 'On the trigger: it opens a menu, and whether it is open.'],
      ['role="menu"', 'The popup; items are menuitem, or menuitemradio with aria-checked in a group of choices.'],
      ['Group labels', 'Name their group, read when focus enters it.'],
    ],
  },
  tooltip: {
    keyboard: [
      ['Tab', 'Focusing the trigger shows the tooltip, as hovering does.'],
      ['Escape', 'Hides it.'],
    ],
    aria: [
      ['Not read separately', 'A tooltip repeats its trigger’s name, such as an icon button’s label, for sighted people. Anything that must be read goes in the name or on the page.'],
    ],
  },
  dialog: {
    keyboard: [
      ['Tab and Shift Tab', 'Move among the dialog’s controls only; the page behind is inert.'],
      ['Escape', 'Closes the dialog and returns focus to what opened it.'],
    ],
    aria: [
      ['<dialog> opened with showModal()', 'The browser moves focus in, keeps it inside and makes the rest of the page inert.'],
      ['aria-labelledby, aria-describedby', 'The title names the dialog; the description is read after it.'],
      ['Close button', 'Named by closeLabel, “Close” by default.'],
      ['Body that scrolls (side panels and sheets)', 'A group named by the title while it scrolls, so the keyboard can scroll it; the indicator beside it is drawn and hidden.'],
    ],
  },
  card: {
    keyboard: [
      ['Tab', 'Moves through the card’s controls in reading order: unit menu, content, footer.'],
      ['Unit menu', 'Opens with Enter, Space or Down arrow, like any menu.'],
      ['Up and Down arrows, Page Up and Page Down', 'On content that scrolls, once it has focus: scroll it. It takes focus only while it scrolls.'],
      ['Left and Right arrows', 'On the chosen day of a calendar (Deliveries, Payment calendar): the previous or next day. In the month, Up and Down move a week.'],
    ],
    aria: [
      ['<section aria-labelledby>', 'Each card is a region named by its title, so the overview can be read card by card. Where the same card shows twice, label names each copy: “Orders, size S”.'],
      ['Unit menu', 'Named with what it shows and what that means: “Unit: plt, Pallets”, so voice control can reach it by its visible text. Its choices are a group of radio items.'],
      ['Summary bar', 'The bar between label and value is drawn, so it is never read aloud.'],
      ['role="group" while scrolling', 'Content that scrolls is a group named by its list (“Deliveries of May 12”) or by the card’s title, so focus arriving on it says what it is. The fade and the indicator are drawn and hidden.'],
    ],
  },
  search: {
    keyboard: [
      ['Typing', 'Searches; the list opens under the field with the results, the first one highlighted.'],
      ['Down and Up arrows', 'Move through the results while focus stays in the field.'],
      ['Enter', 'Chooses the highlighted result.'],
      ['Escape', 'Closes the list; again, clears the field.'],
    ],
    aria: [
      ['role="combobox" on the input', 'With aria-expanded and aria-activedescendant: the highlighted result is read as focus moves, without leaving the field.'],
      ['role="listbox" and role="option"', 'The results; each is read by its text, its icon hidden.'],
      ['role="status"', 'The status line is announced politely: that the search is running, then how the text was read and how many results there are.'],
      ['aria-busy', 'On the field and the list while results are on their way.'],
      ['Label', 'Always present for assistive technology, drawn only with showLabel.'],
    ],
  },
  charts: {
    keyboard: [
      ['Tab', 'Reaches the trend chart and its legend buttons. Tick bars and rings take no focus.'],
      ['Left and Right arrows', 'In the trend chart: read the previous or next day.'],
      ['Home and End', 'Go to the first day or the last day with data.'],
      ['Escape', 'Clears the day being read.'],
      ['Enter or Space', 'On a legend button: shows or hides that series.'],
    ],
    aria: [
      ['role="img" with aria-label', 'Tick bars and rings: one name lists every part with its value.'],
      ['role="group"', 'The trend chart, named by its label with a hint to use the arrow keys.'],
      ['aria-live="polite"', 'The trend chart reads the chosen day: “May 12: 350 plt, 4,485 plt so far”.'],
      ['aria-pressed', 'Legend buttons say whether their series is shown.'],
      ['Chart legend', 'aria-hidden when the chart’s own name already lists the parts, as in every demo here.'],
    ],
  },
  /* ---------- One component per page: the parts of the card, the charts and search ---------- */
  'card-link': {
    keyboard: activate.map(([key, action]) => [key, action.replace('Activates it.', 'Follows the link.')]) as [string, string][],
    aria: [
      ['<a href>', 'A native link: it opens in a new tab, can be copied and is listed with the page’s links.'],
      ['Text', 'Says where it goes, “Go to Orders”, so it reads on its own in a list of links.'],
      ['Arrow', 'Drawn and aria-hidden.'],
    ],
  },
  'scroll-area': {
    keyboard: [
      ['Tab', 'Reaches the area only while it scrolls; when everything fits, focus goes straight to its controls.'],
      ['Up and Down arrows, Page Up and Page Down', 'Scroll the area once it has focus.'],
    ],
    aria: [
      ['role="group" while scrolling', 'Named by label (“Invoices”), so focus arriving on it says what it is.'],
      ['Fade and indicator', 'Drawn, aria-hidden; the area’s own scroll position is what assistive technology reads. No system scrollbar is drawn.'],
    ],
  },
  'card-scroll': {
    keyboard: [
      ['Tab', 'Reaches the list only while it scrolls; when everything fits, focus goes straight to its controls.'],
      ['Up and Down arrows, Page Up and Page Down', 'Scroll the list once it has focus.'],
    ],
    aria: [
      ['role="group" while scrolling', 'Named by label (“Deliveries of May 12”), so focus arriving on it says what it is.'],
      ['Fade and indicator', 'Drawn, aria-hidden; the list’s own scroll position is what assistive technology reads.'],
    ],
  },
  'unit-menu': {
    keyboard: [
      ['Tab', 'Moves focus to the pill.'],
      ['Enter, Space or Down arrow', 'Opens the menu on the chosen unit.'],
      ['Up and Down arrows', 'Move between units; typing a letter jumps to it.'],
      ['Enter or Space', 'Chooses the unit and closes the menu; focus returns to the pill.'],
      ['Escape', 'Closes the menu without a change.'],
    ],
    aria: [
      ['aria-label on the trigger', 'What it measures and what the pill shows: “Unit: plt, Pallets”, so voice control can reach it by its visible text.'],
      ['aria-haspopup and aria-expanded', 'From Base UI: the pill says it opens a menu, and whether it is open.'],
      ['role="menuitemradio"', 'The units are a group of radio items under a label; the chosen one is checked.'],
    ],
  },
  'tick-bar': {
    keyboard: [['None', 'A tick bar is a picture; the card states its figures in text.']],
    aria: [
      ['role="img" with aria-label', 'One name lists every part with its value: “May orders: Shipped 1,420 plt, On hold 80 plt, Pending 1,100 plt”.'],
      ['Ticks', 'Drawn in CSS, so they are never read one by one.'],
    ],
  },
  'ring-chart': {
    keyboard: [['None', 'A ring is a picture; the figures beside it carry the values.']],
    aria: [
      ['role="img" with aria-label', 'One name lists every part with its value, written by format.'],
      ['Content in the hole', 'Read after the name, when it adds to it, such as a total.'],
    ],
  },
  'trend-chart': {
    keyboard: [
      ['Tab', 'Reaches the chart and then its legend buttons.'],
      ['Left and Right arrows', 'Read the previous or next day.'],
      ['Home and End', 'Go to the first day or the last day with data.'],
      ['Escape', 'Clears the day being read.'],
      ['Enter or Space', 'On a legend button: shows or hides that series.'],
    ],
    aria: [
      ['role="group"', 'Named by its label, with a hint to use the arrow keys.'],
      ['aria-live="polite"', 'Reads the chosen day: “May 12: 350 plt, 4,485 plt so far”.'],
      ['aria-pressed', 'Legend buttons say whether their series is shown.'],
    ],
  },
  'chart-legend': {
    keyboard: [['None', 'The legend is text, not a control.']],
    aria: [
      ['<ul role="list">', 'A list of names, read in the order of the chart’s parts.'],
      ['aria-hidden', 'When the chart’s own name already lists the parts, the legend is hidden so they are not read twice.'],
      ['Dots', 'Drawn; the name always says what the color stands for.'],
    ],
  },
  'search-field': {
    keyboard: [
      ['Typing', 'Searches; the list opens under the field with the results, the first one highlighted.'],
      ['Down and Up arrows', 'Move through the results while focus stays in the field.'],
      ['Enter', 'Chooses the highlighted result.'],
      ['Escape', 'Closes the list; again, clears the field.'],
    ],
    aria: [
      ['role="combobox" on the input', 'With aria-expanded and aria-activedescendant: the highlighted result is read as focus moves, without leaving the field.'],
      ['role="status"', 'The status line is announced politely: that the search is running, then how the text was read and how many results there are.'],
      ['aria-busy', 'On the field and the list while results are on their way.'],
      ['Label', 'Always present for assistive technology, drawn only with showLabel.'],
    ],
  },
  'search-result': {
    keyboard: [['None', 'A result is chosen through the search field: arrows and Enter.']],
    aria: [
      ['role="option"', 'Each result is an option of the list, read by its text.'],
      ['Icon', 'aria-hidden: the description says what kind of result it is.'],
      ['Trailing Status', 'Read after the description, in words.'],
    ],
  },
}
