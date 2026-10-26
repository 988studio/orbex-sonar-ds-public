import { Button } from '@orbex/sonar-components/button'
import { ToastProvider, useToast } from '@orbex/sonar-components/toast'
import { useState } from 'react'

/* Saving says it worked; removing offers to take it back. Neither asks first. */
function Actions() {
  const toast = useToast()
  const [shown, setShown] = useState(true)
  return (
    <>
      <Button variant="tonal" onClick={() => toast({ message: 'Layout saved.' })}>
        Save layout
      </Button>
      <Button
        variant="outlined"
        disabled={!shown}
        onClick={() => {
          setShown(false)
          toast({ message: 'Inventory removed from your overview.', action: { label: 'Undo', onClick: () => setShown(true) } })
        }}
      >
        {shown ? 'Remove Inventory' : 'Inventory removed'}
      </Button>
    </>
  )
}

export default function Undo() {
  return (
    <ToastProvider>
      <Actions />
    </ToastProvider>
  )
}
