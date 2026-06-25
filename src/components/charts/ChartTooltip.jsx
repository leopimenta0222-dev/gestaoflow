import { formatBRL } from '../../lib/format'

// Tooltip com a cara do tema (HTML, então usa as CSS vars).
export default function ChartTooltip({ active, payload, label, money = true }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-xs shadow-lg">
      {label && <div className="mb-1 font-medium text-[var(--color-text)]">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[var(--color-muted)]">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <span className="tnum font-medium text-[var(--color-text)]">{money ? formatBRL(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  )
}
