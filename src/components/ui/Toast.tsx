import { AnimatePresence, m } from 'framer-motion'
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../brand/Icon'

type ToastTone = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  tone: ToastTone
  title: string
  message?: string
}

interface ToastContextValue {
  notify: (toast: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const notify = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = ++idRef.current
      setToasts((t) => [...t.slice(-2), { ...toast, id }])
      window.setTimeout(() => dismiss(id), toast.tone === 'error' ? 8000 : 5000)
    },
    [dismiss],
  )
  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex flex-col items-center gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <m.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-lift',
                t.tone === 'error' ? 'border-coral-300 bg-coral-50 text-coral-900' : 'border-teal-100 bg-cream-50 text-teal-900',
              )}
            >
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full',
                  t.tone === 'error' ? 'bg-coral-200 text-coral-800' : 'bg-teal-600 text-cream-100',
                )}
              >
                <Icon name={t.tone === 'error' ? 'close' : 'check'} size={16} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold">{t.title}</p>
                {t.message ? <p className="mt-0.5 text-sm opacity-80">{t.message}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="grid size-7 place-items-center rounded-full opacity-60 transition hover:bg-black/5 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <Icon name="close" size={14} />
              </button>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
