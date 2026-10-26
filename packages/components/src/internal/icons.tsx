/**
 * The few marks components draw themselves. Drawn on a 16 px grid with a 1.75 px stroke, in currentColor,
 * so they take the color and size of their context. Everything else is an icon the product passes in.
 */
import type { ComponentProps } from 'react'

type MarkProps = ComponentProps<'svg'>

const Mark = ({ children, ...props }: MarkProps) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
    {children}
  </svg>
)

export const CheckMark = (props: MarkProps) => (
  <Mark {...props}>
    <path d="m3.75 8.25 2.75 2.75 5.75-6" />
  </Mark>
)

export const DashMark = (props: MarkProps) => (
  <Mark {...props}>
    <path d="M4 8h8" />
  </Mark>
)

export const ChevronDownMark = (props: MarkProps) => (
  <Mark {...props}>
    <path d="m4 6 4 4 4-4" />
  </Mark>
)

export const CloseMark = (props: MarkProps) => (
  <Mark {...props}>
    <path d="m4 4 8 8M12 4l-8 8" />
  </Mark>
)

export const AlertMark = (props: MarkProps) => (
  <Mark {...props}>
    <circle cx="8" cy="8" r="6.25" />
    <path d="M8 4.75v3.75" />
    <path d="M8 11.25h.01" strokeWidth="2.25" />
  </Mark>
)

export const ArrowMark = (props: MarkProps) => (
  <Mark {...props}>
    <path d="M4 8h8M9 5l3 3-3 3" />
  </Mark>
)

export const InfoMark = (props: MarkProps) => (
  <Mark {...props}>
    <circle cx="8" cy="8" r="6.25" />
    <path d="M8 7.25v3.75" />
    <path d="M8 4.75h.01" strokeWidth="2.25" />
  </Mark>
)

export const SuccessMark = (props: MarkProps) => (
  <Mark {...props}>
    <circle cx="8" cy="8" r="6.25" />
    <path d="m5.25 8.25 1.9 1.9 3.6-3.9" />
  </Mark>
)

export const SearchMark = (props: MarkProps) => (
  <Mark {...props}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="m10.5 10.5 3 3" />
  </Mark>
)
