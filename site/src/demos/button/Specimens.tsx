import { Button } from '@orbex/sonar-components/button'
import { AddIcon, ExpandIcon } from '../icons.tsx'
import { Specimen } from '../Specimen.tsx'
import { interactionStates, isDisabled } from '../states.ts'

const variants = ['filled', 'tonal', 'outlined', 'text'] as const
const title = (variant: string) => variant[0]!.toUpperCase() + variant.slice(1)

export function ButtonStates() {
  return (
    <Specimen
      label="Buttons in each variant, at rest, hovered, focused, pressed and disabled"
      columns={interactionStates}
      rows={variants.map((variant) => ({
        name: title(variant),
        render: (column) => (
          <Button variant={variant} disabled={isDisabled(column)}>
            Reorder
          </Button>
        ),
      }))}
    />
  )
}

export function ButtonSizes() {
  return (
    <Specimen
      label="Buttons in each variant, small and medium, with a leading or a trailing icon"
      columns={[{ name: 'Small' }, { name: 'Medium' }, { name: 'Small, icons' }, { name: 'Medium, icons' }]}
      rows={variants.map((variant) => ({
        name: title(variant),
        render: (column) => {
          const size = column.name.startsWith('Small') ? 'small' : 'medium'
          return column.name.endsWith('icons') ? (
            <span style={{ display: 'inline-flex', gap: 8 }}>
              <Button variant={variant} size={size} icon={<AddIcon />}>
                New
              </Button>
              <Button variant={variant} size={size} iconEnd={<ExpandIcon />}>
                Sort
              </Button>
            </span>
          ) : (
            <Button variant={variant} size={size}>
              Details
            </Button>
          )
        },
      }))}
    />
  )
}
