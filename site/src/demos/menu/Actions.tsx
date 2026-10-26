import { Button } from '@orbex/sonar-components/button'
import { Menu } from '@orbex/sonar-components/menu'
import { CopyIcon, DeleteIcon, DownloadIcon, ExpandIcon, PrintIcon, ShareIcon } from '../icons.tsx'

export default function Actions() {
  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outlined" iconEnd={<ExpandIcon />} />}>Actions</Menu.Trigger>
      <Menu.Content>
        <Menu.Item icon={<DownloadIcon />} trailing="CSV">
          Export
        </Menu.Item>
        <Menu.Item icon={<PrintIcon />}>Print</Menu.Item>
        <Menu.Item icon={<ShareIcon />}>Share link</Menu.Item>
        <Menu.Item icon={<CopyIcon />}>Duplicate order</Menu.Item>
        <Menu.Separator />
        <Menu.Item icon={<DeleteIcon />} tone="danger">
          Cancel order
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  )
}
