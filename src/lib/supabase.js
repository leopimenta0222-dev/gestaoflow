import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Sem as variáveis do Supabase, o app roda em "modo demo" com dados locais
 * (ver src/lib/db/demo). Com elas, vira backend real (Postgres + Auth + RLS).
 */
export const isSupabaseConfigured = Boolean(url && key)

export const supabase = isSupabaseConfigured ? createClient(url, key) : null
