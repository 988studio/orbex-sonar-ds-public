/**
 * Icons for the demos: Material Symbols Rounded, weight 400, read from the package at build time. The chevrons
 * that step through days and months are weight 500, as the product draws them.
 * Components take any icon; these only illustrate. Each symbol is a single path on a 960 unit grid.
 */
import type { ComponentProps } from 'react'
import add from '@material-symbols/svg-400/rounded/add.svg?raw'
import calendar from '@material-symbols/svg-400/rounded/calendar_month.svg?raw'
import copy from '@material-symbols/svg-400/rounded/content_copy.svg?raw'
import remove from '@material-symbols/svg-400/rounded/delete.svg?raw'
import download from '@material-symbols/svg-400/rounded/download.svg?raw'
import edit from '@material-symbols/svg-400/rounded/edit.svg?raw'
import expand from '@material-symbols/svg-400/rounded/keyboard_arrow_down.svg?raw'
import filter from '@material-symbols/svg-400/rounded/filter_list.svg?raw'
import grid from '@material-symbols/svg-400/rounded/grid_view.svg?raw'
import list from '@material-symbols/svg-400/rounded/view_list.svg?raw'
import more from '@material-symbols/svg-400/rounded/more_vert.svg?raw'
import notifications from '@material-symbols/svg-400/rounded/notifications.svg?raw'
import print from '@material-symbols/svg-400/rounded/print.svg?raw'
import refresh from '@material-symbols/svg-400/rounded/refresh.svg?raw'
import search from '@material-symbols/svg-400/rounded/search.svg?raw'
import share from '@material-symbols/svg-400/rounded/share.svg?raw'
import shipping from '@material-symbols/svg-400/rounded/local_shipping.svg?raw'
import left from '@material-symbols/svg-500/rounded/chevron_left.svg?raw'
import right from '@material-symbols/svg-500/rounded/chevron_right.svg?raw'
import cart from '@material-symbols/svg-400/rounded/shopping_cart.svg?raw'
import box from '@material-symbols/svg-400/rounded/package_2.svg?raw'
import up from '@material-symbols/svg-400/rounded/arrow_upward.svg?raw'
import down from '@material-symbols/svg-400/rounded/arrow_downward.svg?raw'
import drag from '@material-symbols/svg-400/rounded/drag_indicator.svg?raw'
import bolt from '@material-symbols/svg-400/rounded/bolt.svg?raw'
import boltFill from '@material-symbols/svg-400/rounded/bolt-fill.svg?raw'
import eventBusy from '@material-symbols/svg-400/rounded/event_busy.svg?raw'
import week from '@material-symbols/svg-400/rounded/more_horiz.svg?raw'
import month from '@material-symbols/svg-400/rounded/apps.svg?raw'
import checkCircle from '@material-symbols/svg-400/rounded/check_circle-fill.svg?raw'
import cancelFill from '@material-symbols/svg-400/rounded/cancel-fill.svg?raw'
import swap from '@material-symbols/svg-400/rounded/swap_horiz.svg?raw'
import call from '@material-symbols/svg-400/rounded/call-fill.svg?raw'
import receipt from '@material-symbols/svg-400/rounded/receipt_long.svg?raw'
import schedule from '@material-symbols/svg-400/rounded/schedule.svg?raw'
import error from '@material-symbols/svg-400/rounded/error.svg?raw'
import event from '@material-symbols/svg-400/rounded/event.svg?raw'
import close from '@material-symbols/svg-400/rounded/close.svg?raw'
import addCircle from '@material-symbols/svg-400/rounded/add_circle.svg?raw'
import inventory from '@material-symbols/svg-400/rounded/inventory_2.svg?raw'
import tune from '@material-symbols/svg-400/rounded/tune.svg?raw'
import bank from '@material-symbols/svg-400/rounded/account_balance.svg?raw'
import back from '@material-symbols/svg-400/rounded/arrow_back.svg?raw'
import forward from '@material-symbols/svg-400/rounded/arrow_forward.svg?raw'
import check from '@material-symbols/svg-400/rounded/check.svg?raw'
import northEast from '@material-symbols/svg-400/rounded/north_east.svg?raw'
import sparkle from '@material-symbols/svg-400/rounded/star_shine.svg?raw'
import info from '@material-symbols/svg-400/rounded/info.svg?raw'
import minus from '@material-symbols/svg-400/rounded/remove.svg?raw'
import myLocation from '@material-symbols/svg-400/rounded/my_location.svg?raw'
import zoomOutMap from '@material-symbols/svg-400/rounded/zoom_out_map.svg?raw'
import unfoldMore from '@material-symbols/svg-400/rounded/unfold_more.svg?raw'
import priority from '@material-symbols/svg-400/rounded/priority_high.svg?raw'
import lightbulb from '@material-symbols/svg-400/rounded/lightbulb.svg?raw'
import description from '@material-symbols/svg-400/rounded/description.svg?raw'
import warehouse from '@material-symbols/svg-400/rounded/warehouse.svg?raw'
import monitoring from '@material-symbols/svg-400/rounded/monitoring.svg?raw'
import listAlt from '@material-symbols/svg-400/rounded/list_alt.svg?raw'
import autorenew from '@material-symbols/svg-400/rounded/autorenew.svg?raw'
import requestQuote from '@material-symbols/svg-400/rounded/request_quote.svg?raw'
import eventRepeat from '@material-symbols/svg-400/rounded/event_repeat.svg?raw'
import openInNew from '@material-symbols/svg-400/rounded/open_in_new.svg?raw'

type IconProps = ComponentProps<'svg'>

function symbol(svg: string) {
  const path = svg.match(/ d="([^"]+)"/)?.[1] ?? ''
  return (props: IconProps) => (
    <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d={path} />
    </svg>
  )
}

export const AddIcon = symbol(add)
export const CalendarIcon = symbol(calendar)
export const CopyIcon = symbol(copy)
export const DeleteIcon = symbol(remove)
export const DownloadIcon = symbol(download)
export const EditIcon = symbol(edit)
export const ExpandIcon = symbol(expand)
export const FilterIcon = symbol(filter)
export const GridIcon = symbol(grid)
export const ListIcon = symbol(list)
export const MoreIcon = symbol(more)
export const NotificationsIcon = symbol(notifications)
export const PrintIcon = symbol(print)
export const RefreshIcon = symbol(refresh)
export const SearchIcon = symbol(search)
export const ShareIcon = symbol(share)
export const ShippingIcon = symbol(shipping)
export const ChevronLeftIcon = symbol(left)
export const ChevronRightIcon = symbol(right)
export const CartIcon = symbol(cart)
export const BoxIcon = symbol(box)
export const ArrowUpIcon = symbol(up)
export const ArrowDownIcon = symbol(down)
export const DragIcon = symbol(drag)
export const BoltIcon = symbol(bolt)
export const EventBusyIcon = symbol(eventBusy)
export const WeekIcon = symbol(week)
export const MonthIcon = symbol(month)
export const InStockIcon = symbol(checkCircle)
export const OutOfStockIcon = symbol(cancelFill)
export const SwapIcon = symbol(swap)
export const CallIcon = symbol(call)
export const ReceiptIcon = symbol(receipt)
export const ScheduleIcon = symbol(schedule)
export const ErrorIcon = symbol(error)
export const EventIcon = symbol(event)
export const CloseIcon = symbol(close)
export const AddCircleIcon = symbol(addCircle)
export const InventoryIcon = symbol(inventory)
export const TuneIcon = symbol(tune)
export const BankIcon = symbol(bank)
export const ArrowBackIcon = symbol(back)
export const ArrowForwardIcon = symbol(forward)
export const CheckIcon = symbol(check)
export const NorthEastIcon = symbol(northEast)
export const SparkleIcon = symbol(sparkle)
export const InfoIcon = symbol(info)
export const BoltFillIcon = symbol(boltFill)
export const UnfoldIcon = symbol(unfoldMore)
export const PriorityIcon = symbol(priority)
export const LightbulbIcon = symbol(lightbulb)
export const DescriptionIcon = symbol(description)
export const WarehouseIcon = symbol(warehouse)
export const MonitoringIcon = symbol(monitoring)
export const ListAltIcon = symbol(listAlt)
export const AutorenewIcon = symbol(autorenew)
export const RequestQuoteIcon = symbol(requestQuote)
export const EventRepeatIcon = symbol(eventRepeat)
export const OpenInNewIcon = symbol(openInNew)
export const MinusIcon = symbol(minus)
export const MyLocationIcon = symbol(myLocation)
export const ZoomOutMapIcon = symbol(zoomOutMap)

/** Every icon the demos use, with its Material Symbols name, for the Icons page */
export const catalog = [
  { name: 'unfold_more', Icon: UnfoldIcon },
  { name: 'add', Icon: AddIcon },
  { name: 'calendar_month', Icon: CalendarIcon },
  { name: 'content_copy', Icon: CopyIcon },
  { name: 'delete', Icon: DeleteIcon },
  { name: 'download', Icon: DownloadIcon },
  { name: 'edit', Icon: EditIcon },
  { name: 'keyboard_arrow_down', Icon: ExpandIcon },
  { name: 'filter_list', Icon: FilterIcon },
  { name: 'grid_view', Icon: GridIcon },
  { name: 'view_list', Icon: ListIcon },
  { name: 'more_vert', Icon: MoreIcon },
  { name: 'notifications', Icon: NotificationsIcon },
  { name: 'print', Icon: PrintIcon },
  { name: 'refresh', Icon: RefreshIcon },
  { name: 'search', Icon: SearchIcon },
  { name: 'share', Icon: ShareIcon },
  { name: 'local_shipping', Icon: ShippingIcon },
  { name: 'chevron_left', Icon: ChevronLeftIcon },
  { name: 'chevron_right', Icon: ChevronRightIcon },
  { name: 'shopping_cart', Icon: CartIcon },
  { name: 'package_2', Icon: BoxIcon },
  { name: 'arrow_upward', Icon: ArrowUpIcon },
  { name: 'arrow_downward', Icon: ArrowDownIcon },
  { name: 'drag_indicator', Icon: DragIcon },
  { name: 'bolt', Icon: BoltIcon },
  { name: 'event_busy', Icon: EventBusyIcon },
  { name: 'more_horiz', Icon: WeekIcon },
  { name: 'apps', Icon: MonthIcon },
  { name: 'check_circle-fill', Icon: InStockIcon },
  { name: 'cancel-fill', Icon: OutOfStockIcon },
  { name: 'swap_horiz', Icon: SwapIcon },
  { name: 'call-fill', Icon: CallIcon },
  { name: 'receipt_long', Icon: ReceiptIcon },
  { name: 'schedule', Icon: ScheduleIcon },
  { name: 'error', Icon: ErrorIcon },
  { name: 'event', Icon: EventIcon },
  { name: 'close', Icon: CloseIcon },
  { name: 'add_circle', Icon: AddCircleIcon },
  { name: 'inventory_2', Icon: InventoryIcon },
  { name: 'tune', Icon: TuneIcon },
  { name: 'account_balance', Icon: BankIcon },
  { name: 'arrow_back', Icon: ArrowBackIcon },
  { name: 'arrow_forward', Icon: ArrowForwardIcon },
  { name: 'check', Icon: CheckIcon },
  { name: 'north_east', Icon: NorthEastIcon },
  { name: 'star_shine', Icon: SparkleIcon },
  { name: 'info', Icon: InfoIcon },
  { name: 'bolt-fill', Icon: BoltFillIcon },
  { name: 'remove', Icon: MinusIcon },
  { name: 'my_location', Icon: MyLocationIcon },
  { name: 'zoom_out_map', Icon: ZoomOutMapIcon },
  { name: 'priority_high', Icon: PriorityIcon },
  { name: 'lightbulb', Icon: LightbulbIcon },
  { name: 'description', Icon: DescriptionIcon },
  { name: 'warehouse', Icon: WarehouseIcon },
  { name: 'monitoring', Icon: MonitoringIcon },
  { name: 'list_alt', Icon: ListAltIcon },
  { name: 'autorenew', Icon: AutorenewIcon },
  { name: 'request_quote', Icon: RequestQuoteIcon },
  { name: 'event_repeat', Icon: EventRepeatIcon },
  { name: 'open_in_new', Icon: OpenInNewIcon },
]
