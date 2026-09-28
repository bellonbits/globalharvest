import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import { Icon } from '../brand/Icon'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
  /** Visually hide the title (it is still announced). */
  hideTitle?: boolean
}

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'

/** Accessible dialog: focus trap, Escape to close, scroll lock, focus restore. */
export function Modal({ open, onClose, title, children, className, hideTitle }: ModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus())

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panelRef.current) {
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      restoreRef.current?.focus()
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open ? (
        <m.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-teal-950/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              'relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-cream-100 p-6 shadow-2xl sm:rounded-3xl sm:p-8',
              className,
            )}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 id={titleId} className={cn('text-xl font-semibold text-teal-800', hideTitle && 'sr-only')}>
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="ml-auto grid size-10 shrink-0 place-items-center rounded-full bg-teal-800/5 text-teal-800 transition hover:bg-teal-800 hover:text-cream-100"
                aria-label="Close dialog"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            {children}
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
