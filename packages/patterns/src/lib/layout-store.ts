/**
 * Layouts remembered per mode (1.1, pending #13), as v38 keeps one per mode in localStorage: the desktop, tablet and
 * phone overviews each come back as they were saved. Anything unreadable, or naming a card the app does not have,
 * falls back to the default.
 */
const PREFIX = 'orbex-overview-layout:'

export function loadLayout<T extends Record<string, { id: string }[]>>(mode: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + mode)
    if (!raw) return fallback
    const saved = JSON.parse(raw) as T
    const known = new Set(Object.values(fallback).flat().map((entry) => entry.id))
    const ids = Object.values(saved).flat().map((entry) => entry?.id)
    const sameColumns = Object.keys(saved).sort().join() === Object.keys(fallback).sort().join()
    if (!sameColumns || ids.length !== known.size || !ids.every((id) => known.has(id))) return fallback
    return saved
  } catch {
    return fallback
  }
}

export function saveLayout(mode: string, layout: Record<string, { id: string }[]>) {
  try {
    localStorage.setItem(PREFIX + mode, JSON.stringify(layout))
  } catch {
    /* Private browsing or blocked storage: the layout lasts for this page only */
  }
}

export function forgetLayout(mode: string) {
  try {
    localStorage.removeItem(PREFIX + mode)
  } catch {
    /* nothing kept */
  }
}
