import axe from 'axe-core'

/** Accessibility violations in a rendered subtree. Contrast is checked on the tokens, where layout exists. */
export async function violations(container: Element) {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } })
  return results.violations.map(({ id, nodes }) => `${id}: ${nodes.map((node) => node.html).join(', ')}`)
}
