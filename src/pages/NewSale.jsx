import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Minus, Trash2, ShoppingCart, Coffee, Check } from 'lucide-react'
import { PageHeader, Card, Button, Input, Loading, EmptyState, cx } from '../components/ui'
import { useProducts, useCreateSale } from '../hooks/data'
import { useToast } from '../context/ToastProvider'
import { formatBRL } from '../lib/format'

export default function NewSale() {
  const { data: products, isLoading } = useProducts({ activeOnly: true })
  const createSale = useCreateSale()
  const toast = useToast()
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const list = products ?? []
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter((p) => p.nome.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q))
  }, [products, search])

  const stockOf = (id) => products?.find((p) => p.id === id)?.estoque ?? 0

  const add = (p) => {
    setCart((c) => {
      const found = c.find((i) => i.product_id === p.id)
      if (found) {
        if (found.qtd >= p.estoque) {
          toast.show(`Estoque máximo de ${p.nome} atingido.`, 'error')
          return c
        }
        return c.map((i) => (i.product_id === p.id ? { ...i, qtd: i.qtd + 1 } : i))
      }
      if (p.estoque < 1) {
        toast.show(`${p.nome} sem estoque.`, 'error')
        return c
      }
      return [...c, { product_id: p.id, nome: p.nome, preco: p.preco, qtd: 1 }]
    })
  }

  const setQty = (id, qtd) => {
    if (qtd <= 0) return setCart((c) => c.filter((i) => i.product_id !== id))
    if (qtd > stockOf(id)) {
      toast.show('Quantidade acima do estoque.', 'error')
      return
    }
    setCart((c) => c.map((i) => (i.product_id === id ? { ...i, qtd } : i)))
  }

  const remove = (id) => setCart((c) => c.filter((i) => i.product_id !== id))

  const total = cart.reduce((s, i) => s + i.preco * i.qtd, 0)
  const totalItens = cart.reduce((s, i) => s + i.qtd, 0)

  const finalizar = async () => {
    try {
      const sale = await createSale.mutateAsync(cart.map((i) => ({ product_id: i.product_id, qtd: i.qtd })))
      toast.show(`Venda registrada! ${formatBRL(sale.total)}`)
      setCart([])
    } catch (e) {
      toast.show(e?.message || 'Não foi possível registrar a venda.', 'error')
    }
  }

  if (isLoading) return <Loading />

  return (
    <div>
      <PageHeader title="Nova venda" subtitle="Selecione os produtos e finalize." />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Catálogo */}
        <div>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-faint)]" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto…" className="pl-10" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((p) => {
              const out = p.estoque < 1
              return (
                <button
                  key={p.id}
                  onClick={() => add(p)}
                  disabled={out}
                  className={cx(
                    'flex flex-col rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--color-accent)] disabled:opacity-40 disabled:hover:translate-y-0',
                  )}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]/12 text-[var(--color-accent)]">
                    <Coffee className="h-4 w-4" />
                  </span>
                  <span className="mt-3 line-clamp-2 text-sm font-medium">{p.nome}</span>
                  <span className="mt-1 text-xs text-[var(--color-muted)]">{p.categoria}</span>
                  <span className="mt-2 flex items-center justify-between">
                    <span className="tnum font-semibold text-[var(--color-accent)]">{formatBRL(p.preco)}</span>
                    <span className={cx('text-xs', out ? 'text-red-500' : 'text-[var(--color-faint)]')}>
                      {out ? 'esgotado' : `${p.estoque} un`}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Carrinho */}
        <Card className="flex h-fit flex-col lg:sticky lg:top-24">
          <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-5 py-4">
            <ShoppingCart className="h-4 w-4 text-[var(--color-accent)]" />
            <h3 className="font-[Sora] font-semibold">Carrinho</h3>
            {totalItens > 0 && <span className="ml-auto text-sm text-[var(--color-muted)]">{totalItens} itens</span>}
          </div>

          {cart.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-[var(--color-muted)]">
              Clique nos produtos para adicionar.
            </div>
          ) : (
            <div className="max-h-[46vh] divide-y divide-[var(--color-line)] overflow-y-auto">
              {cart.map((i) => (
                <div key={i.product_id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{i.nome}</div>
                    <div className="tnum text-xs text-[var(--color-muted)]">{formatBRL(i.preco)} · un</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StepBtn onClick={() => setQty(i.product_id, i.qtd - 1)}><Minus className="h-3.5 w-3.5" /></StepBtn>
                    <span className="tnum w-6 text-center text-sm">{i.qtd}</span>
                    <StepBtn onClick={() => setQty(i.product_id, i.qtd + 1)}><Plus className="h-3.5 w-3.5" /></StepBtn>
                  </div>
                  <div className="tnum w-16 text-right text-sm font-medium">{formatBRL(i.preco * i.qtd)}</div>
                  <button onClick={() => remove(i.product_id)} className="text-[var(--color-faint)] hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-[var(--color-line)] px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-[var(--color-muted)]">Total</span>
              <span className="tnum font-[Sora] text-2xl font-bold text-[var(--color-accent)]">{formatBRL(total)}</span>
            </div>
            <Button className="w-full" size="lg" disabled={cart.length === 0} loading={createSale.isPending} onClick={finalizar}>
              <Check className="h-4 w-4" /> Finalizar venda
            </Button>
            <button
              onClick={() => navigate('/vendas')}
              className="mt-2 w-full text-center text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
            >
              Ver vendas registradas
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function StepBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-line)] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
    >
      {children}
    </button>
  )
}
