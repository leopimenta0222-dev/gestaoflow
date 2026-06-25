import { supabase, isSupabaseConfigured } from '../supabase'
import { demo } from './demo'

export async function signIn(email, password) {
  if (!isSupabaseConfigured) return demo.signIn(email, password)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error('E-mail ou senha inválidos.')
  return data.session
}

export async function signOut() {
  if (!isSupabaseConfigured) return demo.signOut()
  await supabase.auth.signOut()
}

export async function getSession() {
  if (!isSupabaseConfigured) return demo.getSession()
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(callback) {
  if (!isSupabaseConfigured) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}
