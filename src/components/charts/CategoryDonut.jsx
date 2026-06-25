import { useMemo } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { revenueByCategory } from '../../lib/analytics'
import { formatBRL } from '../../lib/format'
import ChartTooltip from './ChartTooltip'

const COLORS = ['#b5731f', '#e0a458', '#8a5a2b', '#d4915a', '#6b4423', '#caa06a']

export default function CategoryDonut({ sales }) {
  const data = useMemo(
    () => revenueByCategory(sales).map((c) => ({ name: c.categoria, value: c.receita })),
    [sales],
  )
  const total = data.reduce((s, d) => s + d.value, 0)

  if (!data.length) return <p className="py-10 text-center text-sm text-[var(--color-muted)]">Sem dados no período.</p>

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={84} paddingAngle={2} strokeWidth={0}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-[var(--color-faint)]">Total</span>
          <span className="tnum font-[Sora] text-sm font-bold">{formatBRL(total)}</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="flex-1 text-[var(--color-muted)]">{d.name}</span>
            <span className="tnum font-medium">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
