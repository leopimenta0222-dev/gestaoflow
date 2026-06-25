import { ResponsiveContainer, LineChart, Line } from 'recharts'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, cx } from './ui'
import { formatPct } from '../lib/format'

export default function StatCard({ icon: Icon, label, value, hint, delta, spark }) {
  const up = (delta ?? 0) >= 0
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-[var(--color-faint)]">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-[var(--color-accent)]" />}
      </div>

      <div className="tnum mt-2 font-[Sora] text-2xl font-bold">{value}</div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          {delta != null && (
            <span className={cx('flex items-center gap-0.5 text-xs font-medium', up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
              {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {formatPct(delta)}
            </span>
          )}
          {hint && <span className="text-xs text-[var(--color-faint)]">{hint}</span>}
        </div>

        {spark && spark.length > 1 && (
          <div className="h-9 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spark.map((v, i) => ({ i, v }))}>
                <Line type="monotone" dataKey="v" stroke="#e0a458" strokeWidth={1.75} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  )
}
