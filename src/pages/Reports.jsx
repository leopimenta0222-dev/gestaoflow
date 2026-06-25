import { useState, useMemo } from 'react'
import { FileDown, FileText, BarChart3, TrendingUp } from 'lucide-react'
import { PageHeader, Button, Card, Loading, EmptyState, Badge, cx } from '../components/ui'
import { useSales } from '../hooks/data'
import { useToast } from '../context/ToastProvider'
import { PRESETS, rangeFor, filterSales } from '../lib/periods'
import { revenueTotal, avgTicket, revenueByCategory, topProducts } from '../lib/analytics'
import { formatBRL } from '../lib/format'
import { downloadCsv } from '../lib/csv'

export default function Reports() {
  const { data: sales, isLoading } = useSales()
  const toast = useToast()
  const [preset, setPreset] = useState('30d')

  const { from, to } = rangeFor(preset)
  const periodLabel = PRESETS.find((p) => p.key === preset)?.label ?? ''

  const { rows, categorias, top, resumo } = useMemo(() => {
    const rows = filterSales(sales, from, to)
    const categorias = revenueByCategory(rows)
    const receita = revenueTotal(rows)
    const custo = Math.round(categorias.reduce((s, c) => s + c.custo, 0) * 100) / 100
    const lucro = Math.round((receita - custo) * 100) / 100
    return {
      rows,
      categorias,
      top: topProducts(rows, 8),
      resumo: {
        receita,
        custo,
        lucro,
        margem: receita ? Math.round((lucro / receita) * 100) : 0,
        vendas: rows.length,
        ticket: avgTicket(rows),
      },
    }
  }, [sales, from, to])

  const exportCsv = () => {
    const data = categorias.map((c) => ({
      categoria: c.categoria,
      receita: c.receita,
      custo: c.custo,
      lucro: c.lucro,
      margem_pct: c.receita ? Math.round((c.lucro / c.receita) * 100) : 0,
    }))
    downloadCsv(`relatorio-${preset}.csv`, data, ['categoria', 'receita', 'custo', 'lucro', 'margem_pct'])
    toast.show('CSV exportado.')
  }

  const exportPdf = async () => {
    const { exportReportPdf } = await import('../lib/pdf') // carrega jsPDF só na hora
    exportReportPdf({ negocio: 'Café & Cia', periodo: periodLabel, resumo, categorias, topProdutos: top })
    toast.show('PDF gerado.')
  }

  if (isLoading) return <Loading />

  const hasData = rows.length > 0

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Desempenho por período, categoria e produto."
        actions={
          <div className="flex gap-2">
            <Button variant="subtle" onClick={exportCsv} disabled={!hasData}>
              <FileDown className="h-4 w-4" /> CSV
            </Button>
            <Button variant="subtle" onClick={exportPdf} disabled={!hasData}>
              <FileText className="h-4 w-4" /> PDF
            </Button>
          </div>
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

      {!hasData ? (
        <EmptyState icon={BarChart3} title="Sem dados no período" text="Selecione outro período para ver os relatórios." />
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <ResumoCard label="Faturamento" value={formatBRL(resumo.receita)} />
            <ResumoCard label="Lucro" value={formatBRL(resumo.lucro)} accent />
            <ResumoCard label="Margem" value={`${resumo.margem}%`} />
            <ResumoCard label="Vendas" value={resumo.vendas} />
            <ResumoCard label="Ticket médio" value={formatBRL(resumo.ticket)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Por categoria */}
            <Card className="overflow-hidden">
              <h3 className="border-b border-[var(--color-line)] px-5 py-4 font-[Sora] font-semibold">Por categoria</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-faint)]">
                      <th className="px-5 py-2.5 font-medium">Categoria</th>
                      <th className="px-3 py-2.5 text-right font-medium">Receita</th>
                      <th className="hidden px-3 py-2.5 text-right font-medium sm:table-cell">Lucro</th>
                      <th className="px-5 py-2.5 text-right font-medium">Margem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((c) => (
                      <tr key={c.categoria} className="border-b border-[var(--color-line)] last:border-0">
                        <td className="px-5 py-2.5 font-medium">{c.categoria}</td>
                        <td className="tnum px-3 py-2.5 text-right">{formatBRL(c.receita)}</td>
                        <td className="tnum hidden px-3 py-2.5 text-right text-[var(--color-muted)] sm:table-cell">{formatBRL(c.lucro)}</td>
                        <td className="px-5 py-2.5 text-right">
                          <Badge tone={c.receita && c.lucro / c.receita >= 0.5 ? 'ok' : 'neutral'}>
                            {c.receita ? Math.round((c.lucro / c.receita) * 100) : 0}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Top produtos */}
            <Card className="overflow-hidden">
              <h3 className="flex items-center gap-2 border-b border-[var(--color-line)] px-5 py-4 font-[Sora] font-semibold">
                <TrendingUp className="h-4 w-4 text-[var(--color-accent)]" /> Top produtos
              </h3>
              <ul className="divide-y divide-[var(--color-line)]">
                {top.map((p, i) => (
                  <li key={p.nome} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                    <span className="tnum w-5 text-center text-xs font-bold text-[var(--color-faint)]">{i + 1}</span>
                    <span className="flex-1 font-medium">{p.nome}</span>
                    <span className="text-xs text-[var(--color-muted)]">{p.qtd} un</span>
                    <span className="tnum w-20 text-right font-medium">{formatBRL(p.receita)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function ResumoCard({ label, value, accent }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-[var(--color-faint)]">{label}</div>
      <div className={cx('tnum mt-1 font-[Sora] text-xl font-bold', accent && 'text-[var(--color-accent)]')}>{value}</div>
    </Card>
  )
}
