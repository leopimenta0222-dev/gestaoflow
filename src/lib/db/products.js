import { supabase, isSupabaseConfigured } from '../supabase'
import { demo } from './demo'

export async function listProducts({ activeOnly = false } = {}) {
  if (!isSupabaseConfigured) return demo.listProducts({ activeOnly })
  let q = supabase.from('products').select('*').order('nome')
  if (activeOnly) q = q.eq('ativo', true)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function createProduct(data) {
  if (!isSupabaseConfigured) return demo.createProduct(data)
  const { data: row, error } = await supabase.from('products').insert(data).select().single()
  if (error) throw error
  return row
}

export async function updateProduct(id, patch) {
  if (!isSupabaseConfigured) return demo.updateProduct(id, patch)
  const { data, error } = await supabase.from('products').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  if (!isSupabaseConfigured) return demo.deleteProduct(id)
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}
