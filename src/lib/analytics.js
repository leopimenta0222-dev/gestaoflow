import { format, eachDayOfInterval, parseISO } from 'date-fns'

const round = (n) => Math.round(n * 100) / 100
const asDate = (d) => (d instanceof Date ? d : typeof d === 'string' ? parseISO(d) : new Date(d))

export const revenueTotal = (sales) => round((sales || []).reduce((s, x) => s + Number(x.total || 0), 0))
export const salesCount = (sales) => (sales || []).length
export const avgTicket = (sales) => (sales?.length ? round(revenueTotal(sales) / sales.length) : 0)

export function deltaPct(atual, anterior) {
  if (!anterior) return atual ? 100 : 0
  return round(((atual - anterior) / anterior) * 100)
}

// Série diária cobrindo TODO o range (dias sem venda = 0)
export function revenueByDay(sales, from, to) {
  const days = eachDayOfInterval({ start: asDate(from), end: asDate(to) })
  const map = {}
  for (const s of sales || []) {
    const key = format(asDate(s.created_at), 'yyyy-MM-dd')
    map[key] = (map[key] || 0) + Number(s.total || 0)
  }
  return days.map((d) => {
    const key = format(d, 'yyyy-MM-dd')
    return { date: key, total: round(map[key] || 0) }
  })
}

export function revenueByCategory(sales) {
  const map = {}
  for (const s of sales || [])
    for (const it of s.items || []) {
      const cat = it.categoria || 'Outros'
      if (!map[cat]) map[cat] = { categoria: cat, receita: 0, custo: 0 }
      map[cat].receita += Number(it.preco_unit) * it.qtd
      map[cat].custo += Number(it.custo_unit || 0) * it.qtd
    }
  return Object.values(map)
    .map((c) => ({ categoria: c.categoria, receita: round(c.receita), custo: round(c.custo), lucro: round(c.receita - c.custo) }))
    .sort((a, b) => b.receita - a.receita)
}

export function topProducts(sales, n = 5) {
  const map = {}
  for (const s of sales || [])
    for (const it of s.items || []) {
      const key = it.produto_nome || it.product_id
      if (!map[key]) map[key] = { nome: key, qtd: 0, receita: 0 }
      map[key].qtd += it.qtd
      map[key].receita += Number(it.preco_unit) * it.qtd
    }
  return Object.values(map)
    .map((p) => ({ ...p, receita: round(p.receita) }))
    .sort((a, b) => b.receita - a.receita)
    .slice(0, n)
}

export function mostSold(sales) {
  const ranked = topProducts(sales, 999).sort((a, b) => b.qtd - a.qtd)
  return ranked[0] ?? null
}

export const lowStock = (products) =>
  (products || []).filter((p) => p.ativo !== false && Number(p.estoque) <= Number(p.estoque_minimo))
