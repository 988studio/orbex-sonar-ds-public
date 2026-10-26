import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * False in the server HTML and while the page hydrates, true from the next render on. The side panels are closed on
 * first paint, so they are left out of the server HTML and mount right after hydration: their forms (fields with
 * values, selects) are what browsers and extensions most often touch before a lazy island hydrates, and a changed
 * element there makes React throw #418.
 */
export const useHydrated = () => useSyncExternalStore(subscribe, () => true, () => false)
