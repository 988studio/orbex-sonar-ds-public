import { IconButton } from '@orbex/sonar-components/icon-button'
import { EditIcon } from '../icons.tsx'
import { Specimen } from '../Specimen.tsx'
import { interactionStates, isDisabled } from '../states.ts'

const variants = ['standard', 'filled', 'tonal', 'outlined'] as const
const title = (variant: string) => variant[0]!.toUpperCase() + variant.slice(1)

export function IconButtonStates() {
  return (
    <Specimen
      label="Icon buttons in each variant, at rest, hovered, focused, pressed and disabled, small and medium"
      columns={[...interactionStates, { name: 'Small' }]}
      rows={variants.map((variant) => ({
        name: title(variant),
        render: (column) => (
          <IconButton variant={variant} label="Edit" icon={<EditIcon />} size={column.name === 'Small' ? 'small' : 'medium'} disabled={isDisabled(column)} />
        ),
      }))}
    />
  )
}
