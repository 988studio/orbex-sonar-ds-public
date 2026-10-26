import { Dialog } from '@orbex/sonar-components/dialog'
import { useState, type Dispatch, type SetStateAction } from 'react'
import { ArrowForwardIcon, CheckIcon } from '../icons.tsx'
import { Sep } from './Calendar.tsx'
import { useHydrated } from './hydrated.ts'
import './panels.css'

/* System notifications: the panel the bell in the top bar opens (Alerts on phones), as in the product
   (1.0.0-alpha.18). The product's own notes on what changed in it, newest first; the unread ones have a ring and a red
   dot, and each can be marked as read, or all at once. */
export interface SystemNotice {
  read: boolean
  when: string
  time: string
  title: string
  description: string
}

const NOTICES: SystemNotice[] = [
  { read: false, when: 'Today', time: '09:12', title: 'System update 2.03', description: 'The delivery map now shows route progress in real time. Open any delivery to see it.' },
  { read: false, when: 'Today', time: '08:40', title: 'System update 2.02', description: 'Recurring orders can now be created from your favorites with one click.' },
  { read: true, when: 'Tuesday, May 12', time: '17:23', title: 'System update 2.01', description: 'Show or hide modules with the switches. Move and resize them from Edit layout.' },
  { read: true, when: 'Monday, May 11', time: '17:23', title: 'System update 2.00', description: 'Dark mode is now available from View mode.' },
  { read: true, when: 'Thursday, May 7', time: '10:05', title: 'System update 1.12', description: 'Invoices can be downloaded straight from the overview.' },
  { read: true, when: 'Friday, May 1', time: '09:30', title: 'System update 1.11', description: 'Delivery alerts now include help options and a direct call to the driver.' },
  { read: true, when: 'Wednesday, April 29', time: '16:20', title: 'System update 1.10', description: 'Invoices can now be downloaded in bulk from the documents area.' },
  { read: true, when: 'Friday, April 17', time: '09:00', title: 'System update 1.09', description: 'Delivery notes now include the driver contact for each trip.' },
  { read: true, when: 'Monday, April 6', time: '11:45', title: 'System update 1.08', description: 'Recurring orders remember your last quantities per product.' },
]

/** The notices and their read state, shared by the panel and the bell that counts them */
export const useSystemNotices = () => useState<SystemNotice[]>(() => NOTICES.map((notice) => ({ ...notice })))

export interface SystemPanelProps {
  open: boolean
  onClose: () => void
  notices: SystemNotice[]
  setNotices: Dispatch<SetStateAction<SystemNotice[]>>
}

/** System notifications: a side panel that is not modal, so the top bar stays usable; a sheet from the bottom on phones */
export default function SystemPanel({ open, onClose, notices, setNotices }: SystemPanelProps) {
  const hydrated = useHydrated()
  if (!hydrated) return null
  const unread = notices.filter((notice) => !notice.read).length
  const read = (index: number) => setNotices((list) => list.map((notice, other) => (other === index ? { ...notice, read: true } : notice)))
  return (
    <Dialog
      className="system-panel"
      open={open}
      onOpenChange={(next) => !next && onClose()}
      placement="end"
      modal={false}
      title="System notifications"
      description={
        <>
          {unread ? `${unread} unread` : 'All read'}
          {unread > 0 && (
            <>
              <Sep />
              <button type="button" className="system-link" onClick={() => setNotices((list) => list.map((notice) => ({ ...notice, read: true })))}>
                Mark all as read
              </button>
            </>
          )}
        </>
      }
      actions={
        <a className="system-history" href="#" onClick={(event) => event.preventDefault()}>
          View update history
        </a>
      }
    >
      <ul className="system-list" role="list">
        {notices.map((notice, index) => (
          <li key={notice.title} className="system-item" data-read={notice.read || undefined}>
            <span className="system-icon" aria-hidden="true">
              <CheckIcon />
            </span>
            <span className="system-when">{notice.when}</span>
            <span className="system-time">{notice.time}</span>
            <div className="system-body">
              <p className="system-title">
                {notice.title}
                {!notice.read && <span className="visually-hidden">, unread</span>}
              </p>
              <p className="system-description">{notice.description}</p>
              <div className="system-actions">
                <a className="system-more" href="#" onClick={(event) => event.preventDefault()}>
                  See improvement
                  <ArrowForwardIcon />
                </a>
                {notice.read ? (
                  <span className="system-read">Read</span>
                ) : (
                  <button type="button" className="system-link" onClick={() => read(index)} aria-label={`Mark ${notice.title} as read`}>
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Dialog>
  )
}
