import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { startOfMonth, endOfMonth, subMonths, startOfDay, subDays } from 'date-fns'
import { TrendingUp, ShoppingCart, Receipt, Award, AlertTriangle, Package, ArrowRight } from 'lucide-react'
import { PageHeader, Card, Badge, Loading, cx } from '../components/ui'
import StatCard from '../components/StatCard'
import RevenueChart from '../components/charts/RevenueChart'
import CategoryDonut from '../components/charts/CategoryDonut'
import { useSales, useProducts } from '../hooks/data'
import { filterSales } from '../lib/periods'
import { revenueTotal, avgTicket, deltaPct, revenueByDay, mostSold, lowStock } from '../lib/analytics'
import { formatBRL, formatDateTime, capitalize, formatDateLong } from '../lib/format'

export default function Dashboard() {
  const { data: sales, isLoading: l1 } = useSales()
  const { data: products, isLoading: l2 } = useProducts()

  const m = useMemo(() => {
    const now = new Date()
    const cur = filterSales(sales, startOfMonth(now), endOfMonth(now))
    const prev = filterSales(sales, startOfMonth(subMonths(now, 1)), endOfMonth(subMonths(now, 1)))
    const spark = revenueByDay(sales, startOfDay(subDays(now, 13)), now).map((d) => d.total)
    return {
      now,
      revCur: revenueTotal(cur),
      revDelta: deltaPct(revenueTotal(cur), revenueTotal(prev)),
      cntCur: cur.length,
      cntDelta: deltaPct(cur.length, prev.length),
      ticketCur: avgTicket(cur),
      ticketDelta: deltaPct(avgTicket(cur), avgTicket(prev)),
      top: mostSold(cur),
      spark,
      last30: filterSales(sales, startOfDay(subDays(now, 29)), now),
    }
  }, [sales])

  const low = useMemo(() => lowStock(products), [products])
  const recent = (sales ?? []).slice(0, 6)

  if (l1 || l2) return <Loading />

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={capitalize(formatDateLong(m.now))} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TrendingUp} label="Faturamento do mês" value={formatBRL(m.revCur)} delta={m.revDelta} spark={m.spark} />
        <StatCard icon={ShoppingCart} label="Vendas no mês" value={m.cntCur} delta={m.cntDelta} hint="vs mês anterior" />
        <StatCard icon={Receipt} label="Ticket médio" value={formatBRL(m.ticketCur)} delta={m.ticketDelta} hint="vs mês anterior" />
        <StatCard icon={Award} label="Mais vendido (mês)" value={m.top?.nome ?? '—'} hint={m.top ? `${m.top.qtd} unidades` : 'sem vendas'} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <RevenueChart sales={sales} />
        </Card>
        <Card className="p-5">
          <h3 className="mb-4 font-[Sora] font-semibold">Por categoria (30 dias)</h3>
          <CategoryDonut sales={m.last30} />
        </Card>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {/* Estoque baixo */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-[Sora] font-semibold">
              <AlertTriangle className={cx('h-4 w-4', low.length ? 'text-red-500' : 'text-[var(--color-faint)]')} />
              Estoque baixo
            </h3>
            {low.length > 0 && <Badge tone="low">{low.length}</Badge>}
          </div>
          {low.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--color-muted)]">Tudo certo com o estoque. 👍</p>
          ) : (
            <ul className="divide-y divide-[var(--color-line)]">
              {low.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <div className="font-medium">{p.nome}</div>
                    <div className="text-xs text-[var(--color-muted)]">{p.categoria}</div>
                  </div>
                  <Badge tone="low">{p.estoque} / mín {p.estoque_minimo}</Badge>
                </li>
              ))}
            </ul>
          )}
          <Link to="/produtos" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:underline">
            Gerenciar produtos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>

        {/* Vendas recentes */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-[Sora] font-semibold">Vendas recentes</h3>
            <Link to="/vendas" className="text-xs font-medium text-[var(--color-accent)] hover:underline">Ver todas</Link>
          </div>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-[var(--color-muted)]">
              <Package className="h-6 w-6 text-[var(--color-faint)]" /> Nenhuma venda ainda.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-line)]">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <div className="font-medium">{formatDateTime(s.created_at)}</div>
                    <div className="text-xs text-[var(--color-muted)]">{s.qtd_itens} {s.qtd_itens === 1 ? 'item' : 'itens'}</div>
                  </div>
                  <span className="tnum font-semibold">{formatBRL(s.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
