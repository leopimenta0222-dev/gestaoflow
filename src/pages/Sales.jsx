import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronDown, ShoppingCart } from 'lucide-react'
import { PageHeader, Button, Card, Loading, EmptyState, cx } from '../components/ui'
import { useSales } from '../hooks/data'
import { PRESETS, rangeFor, filterSales } from '../lib/periods'
import { revenueTotal, avgTicket } from '../lib/analytics'
import { formatBRL, formatDateTime } from '../lib/format'

export default function Sales() {
  const { data: sales, isLoading } = useSales()
  const [preset, setPreset] = useState('30d')
  const [expanded, setExpanded] = useState(null)

  const { from, to } = rangeFor(preset)
  const rows = useMemo(() => filterSales(sales, from, to), [sales, from, to])

  if (isLoading) return <Loading />

  return (
    <div>
      <PageHeader
        title="Vendas"
        subtitle="Histórico de vendas registradas."
        actions={
          <Button as={Link} to="/vendas/nova">
            <Plus className="h-4 w-4" /> Nova venda
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            className={cx(
              'rounded-lg border px-3.5 py-1.5 text-sm transition-colors',
              preset === p.key
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                : 'border-[var(--color-line)] text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MiniStat label="Faturamento" value={formatBRL(revenueTotal(rows))} />
        <MiniStat label="Vendas" value={rows.length} />
        <MiniStat label="Ticket médio" value={formatBRL(avgTicket(rows))} />
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Nenhuma venda no período" text="Ajuste o filtro ou registre uma nova venda." />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-[var(--color-line)]">
            {rows.map((s) => (
              <div key={s.id}>
                <button
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                  className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-[var(--color-surface-2)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{formatDateTime(s.created_at)}</div>
                    <div className="text-xs text-[var(--color-muted)]">{s.qtd_itens} {s.qtd_itens === 1 ? 'item' : 'itens'}</div>
                  </div>
                  <div className="tnum font-[Sora] font-semibold">{formatBRL(s.total)}</div>
                  <ChevronDown className={cx('h-4 w-4 text-[var(--color-faint)] transition-transform', expanded === s.id && 'rotate-180')} />
                </button>
                {expanded === s.id && (
                  <div className="bg-[var(--color-surface-2)] px-4 py-3">
                    <table className="w-full text-sm">
                      <tbody>
                        {(s.items ?? []).map((it) => (
                          <tr key={it.id} className="text-[var(--color-muted)]">
                            <td className="py-1">{it.qtd}× {it.produto_nome}</td>
                            <td className="tnum py-1 text-right">{formatBRL(it.preco_unit * it.qtd)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-[var(--color-faint)]">{label}</div>
      <div className="tnum mt-1 font-[Sora] text-xl font-bold">{value}</div>
    </Card>
  )
}
