import { Loader2 } from 'lucide-react'

export const cx = (...parts) => parts.filter(Boolean).join(' ')

export function Container({ className, children }) {
  return <div className={cx('mx-auto w-full max-w-7xl', className)}>{children}</div>
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ---------- Button ---------- */
const BTN_VARIANTS = {
  solid: 'bg-[var(--color-accent)] text-white hover:brightness-110 shadow-sm',
  outline: 'border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10',
  ghost: 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]',
  subtle: 'bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-line)] hover:brightness-95 dark:hover:brightness-125',
  danger: 'border border-red-500/40 text-red-500 hover:bg-red-500/10',
}
const BTN_SIZES = { sm: 'h-9 px-3.5 text-sm', md: 'h-10 px-5 text-sm', lg: 'h-12 px-7 text-base' }

export function Button({ as: Tag = 'button', variant = 'solid', size = 'md', loading = false, className, children, disabled, ...props }) {
  return (
    <Tag
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 active:scale-[.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]',
        'disabled:pointer-events-none disabled:opacity-50',
        BTN_VARIANTS[variant],
        BTN_SIZES[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Tag>
  )
}

/* ---------- Card ---------- */
export function Card({ className, children, ...props }) {
  return (
    <div
      className={cx('rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/* ---------- Badge ---------- */
const BADGE = {
  accent: 'bg-[var(--color-accent)]/12 text-[var(--color-accent)]',
  low: 'bg-red-500/12 text-red-500',
  ok: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  neutral: 'bg-[var(--color-surface-2)] text-[var(--color-muted)]',
}
export function Badge({ tone = 'neutral', children, className }) {
  return (
    <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', BADGE[tone], className)}>
      {children}
    </span>
  )
}

/* ---------- Spinner / Loading / Skeleton ---------- */
export const Spinner = ({ className }) => <Loader2 className={cx('h-5 w-5 animate-spin text-[var(--color-accent)]', className)} />

export function Loading({ label = 'Carregando…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--color-muted)]">
      <Spinner className="h-7 w-7" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export const Skeleton = ({ className }) => (
  <div className={cx('animate-pulse rounded-md bg-[var(--color-surface-2)]', className)} />
)

/* ---------- Form ---------- */
const FIELD = 'w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 text-[var(--color-text)] placeholder:text-[var(--color-faint)] transition-colors focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]'

export const Input = ({ className, ...props }) => <input className={cx(FIELD, 'h-11', className)} {...props} />
export const Textarea = ({ className, ...props }) => <textarea className={cx(FIELD, 'min-h-[88px] py-2.5', className)} {...props} />
export const Select = ({ className, children, ...props }) => (
  <select className={cx(FIELD, 'h-11', className)} {...props}>{children}</select>
)

export function Field({ label, error, hint, children, className }) {
  return (
    <label className={cx('block', className)}>
      {label && <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-[var(--color-faint)]">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  )
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--color-line)] py-14 text-center">
      {Icon && <Icon className="h-8 w-8 text-[var(--color-faint)]" />}
      {title && <p className="font-medium">{title}</p>}
      {text && <p className="max-w-xs text-sm text-[var(--color-muted)]">{text}</p>}
      {action}
    </div>
  )
}
