import { supabase, isSupabaseConfigured } from '../supabase'
import { demo } from './demo'

const toIso = (d) => (d == null ? null : typeof d === 'string' ? d : d.toISOString())

// Retorna vendas com itens achatados: items[].produto_nome / .categoria
export async function listSales({ from, to } = {}) {
  if (!isSupabaseConfigured) return demo.listSales({ from, to })
  let q = supabase
    .from('sales')
    .select('*, sale_items(*, products(nome, categoria))')
    .order('created_at', { ascending: false })
  if (from) q = q.gte('created_at', toIso(from))
  if (to) q = q.lte('created_at', toIso(to))
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map((s) => ({
    ...s,
    items: (s.sale_items ?? []).map((it) => ({
      ...it,
      produto_nome: it.products?.nome,
      categoria: it.products?.categoria,
    })),
  }))
}

// itens: [{ product_id, qtd }]
export async function createSale(itens) {
  if (!isSupabaseConfigured) return demo.createSale(itens)
  const payload = itens.map((it) => ({ product_id: it.product_id, qtd: it.qtd }))
  const { data, error } = await supabase.rpc('create_sale', { p_itens: payload })
  if (error) throw new Error(error.message || 'Não foi possível registrar a venda.')
  return data
}
