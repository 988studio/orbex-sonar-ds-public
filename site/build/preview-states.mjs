/**
 * Preview states, for the documentation only.
 *
 * The components style hover, keyboard focus and press with :hover, :focus-visible and :active. To show those states
 * side by side, without anyone pointing at them, this PostCSS plugin copies each such rule of the components'
 * stylesheets once more, with the pseudo-class replaced by an attribute on an ancestor:
 *
 *   .sonar-button:hover:not(:disabled)   →   [data-preview~='hover'] .sonar-button:not(:disabled)
 *
 * so `<div data-preview="hover">` around a component draws it hovered. A second copy takes the attribute where the
 * pseudo-class was, for one part of a component drawn alone: `<button class="sonar-toast-action" data-preview="hover">`.
 * Copies leave `@media (hover: hover)` so the preview also shows on touch screens. The package itself is never
 * changed: apps get the stylesheets as published.
 */
const STATES = { hover: ':hover', focus: ':focus-visible', pressed: ':active' }
const PSEUDO = /:hover|:focus-visible|:active/

/* A pseudo-class that is the whole argument of :has() leaves `*` behind, so `:has(:focus-visible)` stays valid */
const strip = (selector, pseudo) => selector.split(`(${pseudo})`).join('(*)').split(pseudo).join('')
const inPlace = (selector, pseudo, name) => selector.split(pseudo).join(`[data-preview~='${name}']`)

export default function previewStates({ include }) {
  return {
    postcssPlugin: 'sonar-preview-states',
    Once(root) {
      const file = root.source?.input.file ?? ''
      if (!include.test(file)) return
      const copies = []
      root.walkRules((rule) => {
        if (!PSEUDO.test(rule.selector)) return
        const selectors = rule.selectors.flatMap((selector) =>
          Object.entries(STATES)
            .filter(([, pseudo]) => selector.includes(pseudo))
            .flatMap(([name, pseudo]) => [`[data-preview~='${name}'] ${strip(selector, pseudo)}`, inPlace(selector, pseudo, name)]),
        )
        if (selectors.length) copies.push({ rule, selectors })
      })
      for (const { rule, selectors } of copies) {
        let anchor = rule
        while (anchor.parent?.type === 'atrule' && anchor.parent.name === 'media' && anchor.parent.params.includes('hover')) anchor = anchor.parent
        anchor.after(rule.clone({ selectors }))
      }
    },
  }
}
