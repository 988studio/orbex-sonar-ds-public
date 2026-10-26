/**
 * Theme preference for the documentation site. The design system itself only needs `data-theme`
 * on any element (or nothing, to follow the operating system).
 */
export type ThemePreference = 'system' | 'light' | 'dark'

const KEY = 'sonar-ds-theme'

export function storedTheme(): ThemePreference {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

export function applyTheme(preference: ThemePreference, { remember = false } = {}) {
  const root = document.documentElement
  if (preference === 'system') delete root.dataset.theme
  else root.dataset.theme = preference
  if (!remember) return
  try {
    if (preference === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, preference)
  } catch {
    /* Private browsing or blocked storage: the choice lasts for this page only. */
  }
}

const KNOB_MS = 200
let pending: ReturnType<typeof setTimeout> | undefined

/**
 * Switches the theme the way the product does: the switch's knob slides first (200 ms), then the whole page
 * cross-fades into the new theme with a View Transition (700 ms). Without View Transitions, colors ease over
 * 250 ms; with reduced motion requested, the change is immediate.
 */
export function switchTheme(preference: ThemePreference, { remember = true } = {}) {
  const root = document.documentElement
  const apply = () => applyTheme(preference, { remember })
  clearTimeout(pending)
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return apply()
  if ('startViewTransition' in document) {
    pending = setTimeout(() => document.startViewTransition(apply), KNOB_MS)
    return
  }
  root.classList.add('sonar-theming')
  apply()
  pending = setTimeout(() => root.classList.remove('sonar-theming'), 300)
}
