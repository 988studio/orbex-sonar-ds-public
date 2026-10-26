import '../specimen.css'
/* Tooltips drawn in place with the component’s own class: a short label, and the longest it should get */
export function TooltipVariants() {
  return (
    <div className="specimen-frame" data-scroll-region role="img" aria-label="Two tooltips: a short label, and a label at the longest a tooltip should be">
      <div inert aria-hidden="true" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        <div className="sonar-tooltip">Edit layout</div>
        <div className="sonar-tooltip">Shows quantities in pallets, kilograms or items, for this card only</div>
      </div>
    </div>
  )
}
