import { IconButton } from '@orbex/sonar-components/icon-button'
import { Tooltip, TooltipProvider } from '@orbex/sonar-components/tooltip'
import { DownloadIcon, FilterIcon, PrintIcon, RefreshIcon } from '../icons.tsx'

/* Inside one provider, once a tooltip is open the next one appears at once */
export default function Toolbar() {
  return (
    <TooltipProvider>
      <div role="toolbar" aria-label="Orders" style={{ display: 'flex', gap: 4 }}>
        <Tooltip content="Filter">
          <IconButton label="Filter" icon={<FilterIcon />} />
        </Tooltip>
        <Tooltip content="Refresh">
          <IconButton label="Refresh" icon={<RefreshIcon />} />
        </Tooltip>
        <Tooltip content="Export as CSV">
          <IconButton label="Export as CSV" icon={<DownloadIcon />} />
        </Tooltip>
        <Tooltip content="Print">
          <IconButton label="Print" icon={<PrintIcon />} />
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
