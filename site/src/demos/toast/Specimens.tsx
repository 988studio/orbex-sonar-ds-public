import { CloseMark } from '../Marks.tsx'
import { Specimen, type PreviewState } from '../Specimen.tsx'

/*
 * A toast only exists while it is shown, at the bottom of the window. These are drawn in place with the component’s
 * own classes, for reference; the live example above is the component.
 */
function StaticToast({ message, action, preview }: { message: string; action?: string; preview?: PreviewState }) {
  return (
    <div className="sonar-toast" style={{ pointerEvents: 'none' }}>
      <p className="sonar-toast-message">{message}</p>
      {action && (
        <span className="sonar-toast-action" data-preview={preview}>
          {action}
        </span>
      )}
      <span className="sonar-toast-close">
        <CloseMark />
      </span>
    </div>
  )
}

export function ToastVariants() {
  return (
    <Specimen
      label="Toasts with a message alone and with an action; the action at rest, hovered, focused and pressed"
      columns={[{ name: 'Toast' }]}
      rows={[
        { name: 'Message', render: () => <StaticToast message="Layout saved." /> },
        { name: 'With an action', render: () => <StaticToast message="Recurring orders removed." action="Undo" /> },
        { name: 'Action hovered', render: () => <StaticToast message="Recurring orders removed." action="Undo" preview="hover" /> },
        { name: 'Action focused', render: () => <StaticToast message="Recurring orders removed." action="Undo" preview="focus" /> },
        { name: 'Action pressed', render: () => <StaticToast message="Recurring orders removed." action="Undo" preview="pressed" /> },
      ]}
    />
  )
}
