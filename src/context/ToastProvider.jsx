import { createContext, useContext, useCallback, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)
let counter = 0

const STYLES = {
  success: { icon: CheckCircle2, cls: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400' },
  error: { icon: AlertCircle, cls: 'border-red-500/30 text-red-600 dark:text-red-400' },
  info: { icon: Info, cls: 'border-[var(--color-line)] text-[var(--color-text)]' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const show = useCallback(
    (message, type = 'success') => {
      const id = ++counter
      setToasts((t) => [...t, { id, message, type }])
      setTimeout(() => remove(id), 3500)
    },
    [remove],
  )

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[60] flex w-[min(92vw,340px)] flex-col gap-2">
        {toasts.map((t) => {
          const { icon: Icon, cls } = STYLES[t.type] || STYLES.info
          return (
            <div
              key={t.id}
              className={`reveal flex items-start gap-2.5 rounded-xl border bg-[var(--color-surface)] px-4 py-3 text-sm shadow-lg ${cls}`}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="flex-1 text-[var(--color-text)]">{t.message}</span>
              <button onClick={() => remove(t.id)} className="text-[var(--color-faint)] hover:text-[var(--color-text)]">
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
