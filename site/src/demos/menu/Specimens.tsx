import '../specimen.css'
import { CopyIcon, DeleteIcon, DownloadIcon, PrintIcon } from '../icons.tsx'
import { CheckMark } from '../Marks.tsx'

/*
 * An open menu, drawn in place with the component’s own classes so every kind of item can be seen at once: an item
 * with an icon, one highlighted, one with a shortcut, one disabled, a danger item, a group with a label and a chosen
 * radio item. The live examples above are the component.
 */
export function MenuAnatomy() {
  return (
    <div className="specimen-frame" data-scroll-region role="img" aria-label="An open menu with every kind of item: plain, highlighted, with a shortcut, disabled, danger, and a group of choices with one chosen">
      <div className="sonar-menu" inert aria-hidden="true" style={{ width: 240 }}>
        <div className="sonar-menu-item" data-tone="default">
          <span className="sonar-menu-icon"><CopyIcon /></span>
          <span className="sonar-menu-label">Duplicate order</span>
        </div>
        <div className="sonar-menu-item" data-tone="default" data-highlighted="">
          <span className="sonar-menu-icon"><DownloadIcon /></span>
          <span className="sonar-menu-label">Download PDF</span>
        </div>
        <div className="sonar-menu-item" data-tone="default">
          <span className="sonar-menu-icon"><PrintIcon /></span>
          <span className="sonar-menu-label">Print</span>
          <span className="sonar-menu-trailing">⌘P</span>
        </div>
        <div className="sonar-menu-item" data-tone="default" data-disabled="">
          <span className="sonar-menu-icon"><CopyIcon /></span>
          <span className="sonar-menu-label">Split delivery</span>
        </div>
        <div className="sonar-menu-separator" />
        <div className="sonar-menu-item" data-tone="danger">
          <span className="sonar-menu-icon"><DeleteIcon /></span>
          <span className="sonar-menu-label">Cancel order</span>
        </div>
        <div className="sonar-menu-separator" />
        <div className="sonar-menu-group-label">Unit</div>
        <div className="sonar-menu-item">
          <span className="sonar-menu-label">Pallets</span>
          <span className="sonar-menu-check"><CheckMark /></span>
        </div>
        <div className="sonar-menu-item">
          <span className="sonar-menu-label">Kilograms</span>
        </div>
      </div>
    </div>
  )
}
