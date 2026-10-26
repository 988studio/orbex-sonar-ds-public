import { IconButton } from '@orbex/sonar-components/icon-button'
import { AddIcon, EditIcon, FilterIcon, MoreIcon, NotificationsIcon, SearchIcon } from '../icons.tsx'

export default function Variants() {
  return (
    <>
      <IconButton label="Notifications" icon={<NotificationsIcon />} />
      <IconButton label="Search" icon={<SearchIcon />} variant="outlined" />
      <IconButton label="Edit layout" icon={<EditIcon />} variant="tonal" />
      <IconButton label="New order" icon={<AddIcon />} variant="filled" />
      <IconButton label="Filter" icon={<FilterIcon />} size="small" />
      <IconButton label="More actions" icon={<MoreIcon />} size="small" variant="tonal" />
    </>
  )
}
