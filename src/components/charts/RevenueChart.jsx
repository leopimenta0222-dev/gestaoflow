import { useMemo, useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { format, parseISO, subDays, startOfDay, startOfMonth, subMonths, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { revenueByDay, revenueTotal } from '../../lib/analytics'
import { filterSales } from '../../lib/periods'
import { cx } from '../ui'
import ChartTooltip from './ChartTooltip'

const AXIS = { fontSize: 11, fill: 'var(--color-faint)' }

export default function RevenueChart({ sales }) {
  const [mode, setMode] = useState('dia')

  const daily = useMemo(() => {
    const to = new Date()
    const from = startOfDay(subDays(to, 29))
    return revenueByDay(sales, from, to).map((d) => ({ label: format(parseISO(d.date), 'dd/MM'), total: d.total }))
  }, [sales])

  const monthly = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const m = subMonths(startOfMonth(now), 5 - i)
      const inMonth = filterSales(sales, startOfMonth(m), new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59))
      return { label: format(m, 'MMM', { locale: ptBR }), total: revenueTotal(inMonth) }
    })
  }, [sales])

  const data = mode === 'dia' ? daily : monthly

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-[Sora] font-semibold">Faturamento</h3>
        <div className="flex gap-1 rounded-lg border border-[var(--color-line)] p-0.5">
          {[['dia', '30 dias'], ['mes', 'Por mês']].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={cx(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                mode === k ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]',
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        {mode === 'dia' ? (
          <AreaChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e0a458" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#e0a458" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="label" tick={AXIS} interval={4} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `R$${v}`} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-accent)', strokeOpacity: 0.3 }} />
            <Area type="monotone" dataKey="total" name="Faturamento" stroke="#b5731f" strokeWidth={2} fill="url(#revArea)" />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `R$${v}`} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-accent)', fillOpacity: 0.08 }} />
            <Bar dataKey="total" name="Faturamento" fill="#e0a458" radius={[5, 5, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
