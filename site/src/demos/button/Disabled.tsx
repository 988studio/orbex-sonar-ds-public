import { Button } from '@orbex/sonar-components/button'

export default function Disabled() {
  return (
    <>
      <Button disabled>Place order</Button>
      <Button variant="tonal" disabled>
        Reorder
      </Button>
      <Button variant="outlined" disabled>
        Export
      </Button>
      <Button variant="text" disabled>
        View all
      </Button>
    </>
  )
}
