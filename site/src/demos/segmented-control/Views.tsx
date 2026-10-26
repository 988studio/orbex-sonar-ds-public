import { SegmentedControl } from '@orbex/sonar-components/segmented-control'
import { CalendarIcon, GridIcon, ListIcon } from '../icons.tsx'

export default function Views() {
  return (
    <SegmentedControl
      legend="View"
      hideLegend
      iconOnly
      size="small"
      defaultValue="list"
      options={[
        { value: 'list', label: 'List', icon: <ListIcon /> },
        { value: 'grid', label: 'Grid', icon: <GridIcon /> },
        { value: 'calendar', label: 'Calendar', icon: <CalendarIcon /> },
      ]}
    />
  )
}
