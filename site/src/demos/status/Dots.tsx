import { Status } from '@orbex/sonar-components/status'

export default function Dots() {
  return (
    <>
      <Status tone="positive">Delivered</Status>
      <Status tone="warning">Due today</Status>
      <Status tone="danger">Delayed</Status>
      <Status>Scheduled</Status>
    </>
  )
}
