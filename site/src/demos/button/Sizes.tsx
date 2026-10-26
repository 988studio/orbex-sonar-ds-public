import { Button } from '@orbex/sonar-components/button'
import { AddIcon, DownloadIcon, ExpandIcon } from '../icons.tsx'

export default function Sizes() {
  return (
    <>
      <Button icon={<AddIcon />}>New order</Button>
      <Button variant="outlined" iconEnd={<ExpandIcon />}>
        All accounts
      </Button>
      <Button size="small" variant="tonal" icon={<DownloadIcon />}>
        Invoice
      </Button>
      <Button size="small" variant="outlined">
        Details
      </Button>
    </>
  )
}
