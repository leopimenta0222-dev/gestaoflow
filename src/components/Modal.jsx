import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="reveal relative w-full rounded-t-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-2xl sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-4">
          <h3 className="font-[Sora] text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Fechar" className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-[var(--color-line)] px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}
