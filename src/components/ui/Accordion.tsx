import { AnimatePresence, m } from 'framer-motion'
import { useId, useState } from 'react'
import { cn } from '../../lib/cn'
import type { FAQItem } from '../../types'
import { Icon } from '../brand/Icon'

/** Accessible disclosure list (button + region), one item open at a time. */
export function Accordion({ items, className }: { items: FAQItem[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0)
  const baseId = useId()
  return (
    <div className={cn('divide-y divide-teal-800/12 border-y border-teal-800/12', className)}>
      {items.map((item, i) => {
        const isOpen = open === i
        const btnId = `${baseId}-btn-${i}`
        const panelId = `${baseId}-panel-${i}`
        return (
          <div key={item.question}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left font-display text-lg font-medium text-teal-800 transition hover:text-coral-700"
              >
                {item.question}
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-full border border-teal-800/15 transition duration-300',
                    isOpen && 'rotate-45 border-coral-400 bg-coral-400 text-teal-950',
                  )}
                >
                  <Icon name="plus" size={16} strokeWidth={2} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <m.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 leading-relaxed text-teal-900/75">{item.answer}</p>
                </m.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
