import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { Badge, Button, Checkbox, IconButton, SegmentedControl, SelectField, Status, Switch, TextField } from '../src/index.ts'
import { violations } from './axe.ts'

describe('Button', () => {
  test('is a native button that does not submit forms unless asked', async () => {
    const { container } = render(<Button variant="tonal" icon={<svg />}>Export</Button>)
    const button = screen.getByRole('button', { name: 'Export' })
    expect(button.getAttribute('type')).toBe('button')
    expect(button.dataset.variant).toBe('tonal')
    expect(container.querySelector('.sonar-button-icon')?.getAttribute('aria-hidden')).toBe('true')
    expect(await violations(container)).toEqual([])
  })
})

describe('IconButton', () => {
  test('is named by its label', async () => {
    const { container } = render(<IconButton label="Notifications" icon={<svg />} />)
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeTruthy()
    expect(await violations(container)).toEqual([])
  })
})

describe('Badge', () => {
  test('caps the count and reads its label instead of the number', () => {
    render(<Badge count={120} label="120 unpaid invoices" />)
    expect(screen.getByText('99+').getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByText('120 unpaid invoices')).toBeTruthy()
  })

  test('is a dot without a count', () => {
    const { container } = render(<Badge label="New messages" />)
    expect(container.querySelector('.sonar-badge')?.hasAttribute('data-dot')).toBe(true)
  })
})

describe('Status', () => {
  test('names the state in words', async () => {
    const { container } = render(<Status tone="danger">Delayed</Status>)
    expect(screen.getByText('Delayed').dataset.tone).toBe('danger')
    expect(await violations(container)).toEqual([])
  })
})

describe('Switch', () => {
  test('is a checkbox with the switch role, described by its help', async () => {
    const onChange = vi.fn()
    const { container } = render(<Switch label="Compact figures" description="1.96K instead of 1,960" onChange={onChange} />)
    const control = screen.getByRole('switch', { name: 'Compact figures' })
    expect(control.getAttribute('aria-describedby')).toBe(screen.getByText('1.96K instead of 1,960').id)
    fireEvent.click(control)
    expect((control as HTMLInputElement).checked).toBe(true)
    expect(onChange).toHaveBeenCalledOnce()
    expect(await violations(container)).toEqual([])
  })
})

describe('Checkbox', () => {
  test('sets the indeterminate state on the element', async () => {
    const { container, rerender } = render(<Checkbox label="All deliveries" indeterminate />)
    const control = screen.getByRole('checkbox', { name: 'All deliveries' }) as HTMLInputElement
    expect(control.indeterminate).toBe(true)
    rerender(<Checkbox label="All deliveries" />)
    expect(control.indeterminate).toBe(false)
    expect(await violations(container)).toEqual([])
  })
})

describe('SegmentedControl', () => {
  const options = [
    { value: 'plt', label: 'Pallets' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'items', label: 'Items' },
  ]

  test('is a group of radios named by its legend', async () => {
    const onValueChange = vi.fn()
    const { container } = render(<SegmentedControl legend="Unit" options={options} defaultValue="plt" onValueChange={onValueChange} />)
    expect(screen.getByRole('group', { name: 'Unit' })).toBeTruthy()
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(new Set(radios.map(({ name }) => name)).size).toBe(1)
    expect(radios[0]?.checked).toBe(true)
    fireEvent.click(screen.getByRole('radio', { name: 'Kilograms' }))
    expect(onValueChange).toHaveBeenCalledWith('kg')
    expect(await violations(container)).toEqual([])
  })

  test('keeps names for assistive technology when it shows icons only', () => {
    render(<SegmentedControl legend="View" hideLegend iconOnly options={[{ value: 'list', label: 'List', icon: <svg /> }, { value: 'grid', label: 'Grid', icon: <svg /> }]} />)
    expect(screen.getByRole('radio', { name: 'Grid' })).toBeTruthy()
    expect(screen.getByRole('group', { name: 'View' })).toBeTruthy()
  })
})

describe('Fields', () => {
  test('a text field ties its label, help and error to the input', async () => {
    const { container } = render(<TextField label="Quantity" description="In pallets" error="Enter at least 1" placeholder="0" />)
    const input = screen.getByLabelText('Quantity')
    const described = (input.getAttribute('aria-describedby') ?? '').split(' ')
    expect(described).toEqual([screen.getByText('In pallets').id, screen.getByText('Enter at least 1').closest('p')!.id])
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(await violations(container)).toEqual([])
  })

  test('a select field is a native select', async () => {
    const { container } = render(
      <SelectField label="Warehouse" defaultValue="north">
        <option value="north">North</option>
        <option value="south">South</option>
      </SelectField>,
    )
    expect((screen.getByLabelText('Warehouse') as HTMLSelectElement).value).toBe('north')
    expect(await violations(container)).toEqual([])
  })
})
