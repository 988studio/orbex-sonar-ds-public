import { useRef, type ComponentProps } from 'react'
import { cx } from '../internal/cx.ts'
import { useScrollArea } from '../internal/scroll-area.ts'

export interface ScrollAreaProps extends ComponentProps<'div'> {
  /** What the content is, read when the area takes focus to scroll: “Invoices”, “System notifications”. */
  label: string
  /**
   * Where the indicator runs. Outside: in the padding beside the area, 4 to 6 px past its end, as in the product’s
   * cards and panels, where there is padding to hold it. Inside: in a lane of its own at the end of the area, which
   * the content never reaches, for an area with no padding beside it.
   * @default 'outside'
   */
  indicator?: 'outside' | 'inside'
}

/**
 * Content that scrolls inside a fixed height, as the product’s lists do: no scrollbar of the system, a fade at each
 * edge that has more, and a thin indicator that shows while it scrolls and fades out a second after. The indicator
 * never covers the content or its buttons. While it scrolls the area is a named group that takes focus, so the
 * keyboard scrolls it; when everything fits it is plain content and adds no tab stop.
 */
export function ScrollArea({ label, indicator = 'outside', className, children, ...props }: ScrollAreaProps) {
  const area = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLSpanElement>(null)
  useScrollArea(area, thumb, true, 'fit')
  return (
    <div className={cx('sonar-scroll-area', className)} data-indicator={indicator} {...props}>
      <div ref={area} className="sonar-scroll-area-viewport" data-label={label}>
        {children}
      </div>
      <span ref={thumb} className="sonar-scroll-area-thumb" aria-hidden="true" hidden />
    </div>
  )
}
