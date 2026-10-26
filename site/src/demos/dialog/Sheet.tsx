import { Button } from '@orbex/sonar-components/button'
import { Dialog } from '@orbex/sonar-components/dialog'
import { TextField } from '@orbex/sonar-components/field'
import { useState } from 'react'

/* On phones, panels rise from the bottom, with no scrim. Typing would be lost, so a tap outside does not close this one. */
export default function Sheet() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="tonal" onClick={() => setOpen(true)}>
        New order on a phone
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        placement="bottom"
        dismissible={false}
        title="New order"
        actions={<Button onClick={() => setOpen(false)}>Place order</Button>}
      >
        <TextField label="Product" placeholder="Name or code" />
        <TextField label="Quantity" type="number" inputMode="numeric" placeholder="0" description="In pallets." />
      </Dialog>
    </>
  )
}
