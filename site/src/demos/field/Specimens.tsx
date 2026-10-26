import { SelectField, TextField } from '@orbex/sonar-components/field'
import { SearchIcon } from '../icons.tsx'
import { Specimen, type PreviewState } from '../Specimen.tsx'

const width = { width: 220 }

const states: { name: string; preview?: PreviewState; value?: string; description?: string; error?: string; disabled?: boolean }[] = [
  { name: 'Empty' },
  { name: 'Hover', preview: 'hover' },
  { name: 'Focus', preview: 'focus' },
  { name: 'Filled', value: '40' },
  { name: 'With help', value: '40', description: 'Up to 120 per order.' },
  { name: 'Error', value: '140', error: 'Up to 120 per order.' },
  { name: 'Disabled', value: '40', disabled: true },
]

export function FieldStates() {
  return (
    <Specimen
      label="Text fields and selects empty, hovered, focused, filled, with help, with an error and disabled"
      columns={[{ name: 'Text field' }, { name: 'Select' }]}
      rows={states.map(({ name, preview, value, description, error, disabled }) => ({
        name,
        preview,
        render: (column) => (
          <div style={width}>
            {column.name === 'Text field' ? (
              <TextField label="Quantity" placeholder="Pallets" value={value ?? ''} readOnly description={description} error={error} disabled={disabled} />
            ) : (
              <SelectField label="Warehouse" value={value ? 'north' : ''} onChange={() => {}} description={description} error={error && 'Choose a warehouse with stock.'} disabled={disabled}>
                <option value="">Choose one</option>
                <option value="north">North, Girona</option>
              </SelectField>
            )}
          </div>
        ),
      }))}
    />
  )
}

export function FieldSizes() {
  return (
    <Specimen
      label="Text fields and selects, medium and small, with and without an icon"
      columns={[{ name: 'Medium' }, { name: 'Small' }]}
      rows={['Text field', 'With an icon', 'Select'].map((kind) => ({
        name: kind,
        render: (column) => {
          const size = column.name === 'Medium' ? 'medium' : 'small'
          return (
            <div style={width}>
              {kind === 'Select' ? (
                <SelectField label="Warehouse" size={size} defaultValue="north">
                  <option value="north">North, Girona</option>
                </SelectField>
              ) : (
                <TextField label={kind === 'Text field' ? 'Product' : 'Search'} size={size} placeholder="Name or code" icon={kind === 'With an icon' ? <SearchIcon /> : undefined} />
              )}
            </div>
          )
        },
      }))}
    />
  )
}
