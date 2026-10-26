import { IconButton } from '@orbex/sonar-components/icon-button'
import { Menu } from '@orbex/sonar-components/menu'
import { useState } from 'react'
import { MoreIcon, RefreshIcon } from '../icons.tsx'

export default function Units() {
  const [unit, setUnit] = useState('plt')
  return (
    <Menu.Root>
      <Menu.Trigger render={<IconButton label="Inventory options" icon={<MoreIcon />} />} />
      <Menu.Content align="end">
        <Menu.Group>
          <Menu.GroupLabel>Show figures in</Menu.GroupLabel>
          <Menu.RadioGroup value={unit} onValueChange={(value) => setUnit(String(value))}>
            <Menu.RadioItem value="plt">Pallets</Menu.RadioItem>
            <Menu.RadioItem value="kg">Kilograms</Menu.RadioItem>
            <Menu.RadioItem value="items">Items</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Item icon={<RefreshIcon />}>Refresh stock</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  )
}
