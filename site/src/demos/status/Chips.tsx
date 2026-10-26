import { Status } from '@orbex/sonar-components/status'

export default function Chips() {
  return (
    <>
      <Status appearance="chip" tone="positive">Paid</Status>
      <Status appearance="chip" tone="warning">On hold</Status>
      <Status appearance="chip" tone="danger">Overdue</Status>
      <Status appearance="chip">Draft</Status>
    </>
  )
}
