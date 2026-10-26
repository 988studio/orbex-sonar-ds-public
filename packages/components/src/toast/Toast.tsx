import { Toast as BaseToast } from '@base-ui/react/toast'
import { useCallback, type CSSProperties, type ReactNode } from 'react'
import { CloseMark } from '../internal/icons.tsx'

export interface ToastProviderProps {
  /** The part of the app that can show toasts, usually all of it. useToast works anywhere inside. */
  children: ReactNode
  /**
   * Time a toast stays, in milliseconds. One with an action stays twice as long, so there is time to use it.
   * @default 5000
   */
  timeout?: number
  /**
   * Name of the close button.
   * @default 'Dismiss'
   */
  closeLabel?: string
  /**
   * Name of the region the toasts appear in. Give each provider its own when a page has more than one.
   * @default 'Notifications'
   */
  label?: string
  /**
   * Where the toasts sit, as CSS lengths: `left` and `right` bound the area they centre in (such as the main area,
   * right of a sidebar), `bottom` lifts them above a footer or a bottom app bar. The window’s safe area is added to
   * `bottom`.
   * @default { left: 0, right: 0, bottom: 24px }
   * @since 1.1.0
   */
  inset?: { left?: string; right?: string; bottom?: string }
  /**
   * Whether toasts carry a close button. One with an action can still be swiped away or wait for its timeout.
   * @default true
   * @since 1.1.0
   */
  closeButton?: boolean
}

export interface ShowToastOptions {
  /** What happened, in one short sentence: “Layout saved.” */
  message: string
  /** One action, usually Undo. */
  action?: { label: string; onClick: () => void }
  /** Overrides the provider’s timeout for this toast. */
  timeout?: number
  /** Overrides the provider’s closeButton for this toast. @since 1.1.0 */
  closeButton?: boolean
}

/**
 * Feedback on something that just happened, on the inverse surface at the bottom of the window, with at most one
 * action. One toast at a time: a new one replaces the last. Base UI announces it, pauses it while hovered or focused,
 * and lets it be swiped away.
 */
export function ToastProvider({ children, timeout = 5000, closeLabel = 'Dismiss', label = 'Notifications', inset, closeButton = true }: ToastProviderProps) {
  const style = inset && ({
    ...(inset.left !== undefined && { '--sonar-toast-left': inset.left }),
    ...(inset.right !== undefined && { '--sonar-toast-right': inset.right }),
    ...(inset.bottom !== undefined && { '--sonar-toast-bottom': inset.bottom }),
  } as CSSProperties)
  return (
    <BaseToast.Provider timeout={timeout} limit={1}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport className="sonar-toast-viewport" aria-label={label} style={style || undefined}>
          <ToastList closeLabel={closeLabel} closeButton={closeButton} />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  )
}

function ToastList({ closeLabel, closeButton }: { closeLabel: string; closeButton: boolean }) {
  const { toasts } = BaseToast.useToastManager()
  return toasts.map((toast) => {
    const close = (toast.data as { closeButton?: boolean } | undefined)?.closeButton ?? closeButton
    return (
      <BaseToast.Root key={toast.id} toast={toast} className="sonar-toast" data-close={close ? undefined : 'none'} swipeDirection={['down', 'right']}>
        <BaseToast.Title className="sonar-toast-message" />
        {toast.actionProps && <BaseToast.Action className="sonar-toast-action" />}
        {close && (
          <BaseToast.Close className="sonar-toast-close" aria-label={closeLabel}>
            <CloseMark />
          </BaseToast.Close>
        )}
      </BaseToast.Root>
    )
  })
}

/** Shows a toast from anywhere inside a ToastProvider. Returns a function that closes it. */
export function useToast() {
  const manager = BaseToast.useToastManager()
  return useCallback(
    ({ message, action, timeout, closeButton }: ShowToastOptions) => {
      const id = manager.add({
        title: message,
        ...(closeButton !== undefined && { data: { closeButton } }),
        ...(timeout !== undefined ? { timeout } : action ? { timeout: 10000 } : {}),
        ...(action && {
          actionProps: {
            children: action.label,
            onClick: () => {
              action.onClick()
              manager.close(id)
            },
          },
        }),
      })
      return () => manager.close(id)
    },
    [manager],
  )
}
