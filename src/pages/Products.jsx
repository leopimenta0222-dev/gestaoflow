import { useState, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Search, Package, AlertTriangle } from 'lucide-react'
import { PageHeader, Button, Card, Field, Input, Select, Badge, Loading, EmptyState, cx } from '../components/ui'
import Modal from '../components/Modal'
import { useProducts, useProductMutations } from '../hooks/data'
import { useToast } from '../context/ToastProvider'
import { formatBRL } from '../lib/format'

const schema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome'),
  categoria: z.string().trim().min(1, 'Informe a categoria'),
  preco: z.coerce.number().min(0, 'Preço inválido'),
  custo: z.coerce.number().min(0, 'Custo inválido'),
  estoque: z.coerce.number().int('Use número inteiro').min(0, 'Estoque inválido'),
  estoque_minimo: z.coerce.number().int('Use número inteiro').min(0, 'Mínimo inválido'),
  ativo: z.boolean(),
})

const margem = (p) => (p.preco > 0 ? Math.round(((p.preco - p.custo) / p.preco) * 100) : 0)

export default function Products() {
  const { data: products, isLoading } = useProducts()
  const { create, update, remove } = useProductMutations()
  const toast = useToast()
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('todas')

  const categorias = useMemo(
    () => [...new Set((products ?? []).map((p) => p.categoria))].sort(),
    [products],
  )

  const rows = useMemo(() => {
    let list = [...(products ?? [])]
    if (cat !== 'todas') list = list.filter((p) => p.categoria === cat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.nome.toLowerCase().includes(q))
    }
    return list
  }, [products, cat, search])

  const onSubmit = async (values) => {
    try {
      if (editing?.id) await update.mutateAsync({ id: editing.id, patch: values })
      else await create.mutateAsync(values)
      toast.show(editing?.id ? 'Produto atualizado.' : 'Produto criado.')
      setEditing(null)
    } catch (e) {
      toast.show(e?.message || 'Erro ao salvar.', 'error')
    }
  }

  if (isLoading) return <Loading />

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle="Cadastro, preços e estoque."
        actions={
          <Button onClick={() => setEditing(EMPTY)}>
            <Plus className="h-4 w-4" /> Novo produto
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-faint)]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto…" className="pl-10" />
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="sm:w-52">
          <option value="todas">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Package} title="Nenhum produto" text="Cadastre o primeiro produto para começar." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-faint)]">
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Preço</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Custo</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Margem</th>
                  <th className="px-4 py-3 font-medium">Estoque</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const low = p.estoque <= p.estoque_minimo
                  return (
                    <tr key={p.id} className={cx('border-b border-[var(--color-line)] last:border-0', !p.ativo && 'opacity-50')}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.nome}</div>
                        <div className="text-xs text-[var(--color-muted)]">{p.categoria}</div>
                      </td>
                      <td className="px-4 py-3 tnum font-medium">{formatBRL(p.preco)}</td>
                      <td className="hidden px-4 py-3 tnum text-[var(--color-muted)] sm:table-cell">{formatBRL(p.custo)}</td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <Badge tone={margem(p) >= 50 ? 'ok' : 'neutral'}>{margem(p)}%</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {low ? (
                          <Badge tone="low" className="gap-1">
                            <AlertTriangle className="h-3 w-3" /> {p.estoque}
                          </Badge>
                        ) : (
                          <span className="tnum">{p.estoque}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <IconBtn title="Editar" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></IconBtn>
                          <IconBtn title="Excluir" onClick={() => setDeleting(p)} className="hover:border-red-500/40 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ProductFormModal editing={editing} categorias={categorias} onClose={() => setEditing(null)} onSubmit={onSubmit} saving={create.isPending || update.isPending} />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Excluir produto?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>Cancelar</Button>
            <Button
              variant="danger"
              loading={remove.isPending}
              onClick={async () => {
                try {
                  await remove.mutateAsync(deleting.id)
                  toast.show('Produto excluído.')
                } catch (e) {
                  toast.show(e?.message || 'Erro ao excluir.', 'error')
                }
                setDeleting(null)
              }}
            >
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-muted)]">
          Remover <strong className="text-[var(--color-text)]">{deleting?.nome}</strong>? Vendas já registradas não são afetadas.
        </p>
      </Modal>
    </div>
  )
}

const EMPTY = { nome: '', categoria: '', preco: 0, custo: 0, estoque: 0, estoque_minimo: 5, ativo: true }

function ProductFormModal({ editing, categorias, onClose, onSubmit, saving }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY })

  useEffect(() => {
    if (editing) reset({ ...EMPTY, ...editing })
  }, [editing, reset])

  return (
    <Modal
      open={Boolean(editing)}
      onClose={onClose}
      title={editing?.id ? 'Editar produto' : 'Novo produto'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button loading={saving} onClick={handleSubmit(onSubmit)}>Salvar</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Nome" error={errors.nome?.message}>
          <Input {...register('nome')} placeholder="Ex: Cappuccino" />
        </Field>
        <Field label="Categoria" error={errors.categoria?.message}>
          <Input {...register('categoria')} placeholder="Ex: Cafés" list="categorias" />
          <datalist id="categorias">
            {categorias.map((c) => <option key={c} value={c} />)}
          </datalist>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Preço (R$)" error={errors.preco?.message}>
            <Input type="number" step="0.01" min="0" {...register('preco')} />
          </Field>
          <Field label="Custo (R$)" error={errors.custo?.message}>
            <Input type="number" step="0.01" min="0" {...register('custo')} />
          </Field>
          <Field label="Estoque" error={errors.estoque?.message}>
            <Input type="number" min="0" {...register('estoque')} />
          </Field>
          <Field label="Estoque mínimo" error={errors.estoque_minimo?.message}>
            <Input type="number" min="0" {...register('estoque_minimo')} />
          </Field>
        </div>
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" {...register('ativo')} className="h-4 w-4 accent-[var(--color-accent)]" />
          Produto ativo (disponível para venda)
        </label>
      </form>
    </Modal>
  )
}

function IconBtn({ children, title, onClick, className }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cx('flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-line)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-line)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]', className)}
    >
      {children}
    </button>
  )
}
