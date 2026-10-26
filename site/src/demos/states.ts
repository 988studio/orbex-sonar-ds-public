import type { SpecimenColumn } from './Specimen.tsx'

/* The interaction states every control draws, in the order they happen */
export const interactionStates: SpecimenColumn[] = [
  { name: 'Rest' },
  { name: 'Hover', preview: 'hover' },
  { name: 'Focus', preview: 'focus' },
  { name: 'Pressed', preview: 'pressed' },
  { name: 'Disabled' },
]

export const isDisabled = (column: SpecimenColumn) => column.name === 'Disabled'
