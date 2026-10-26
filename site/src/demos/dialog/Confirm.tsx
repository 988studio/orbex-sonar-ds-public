import { Button } from '@orbex/sonar-components/button'
import { Dialog } from '@orbex/sonar-components/dialog'
import { useState } from 'react'

/* Confirm only what cannot be undone. The main action goes last; the dialog closes on any choice. */
export default function Confirm() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Reset to default
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Reset the overview?"
        description="Your cards go back to the default layout. Cards you added stay available in Customize."
        actions={
          <>
            <Button variant="text" onClick={() => setOpen(false)}>
              Keep my layout
            </Button>
            <Button onClick={() => setOpen(false)}>Reset</Button>
          </>
        }
      />
    </>
  )
}
