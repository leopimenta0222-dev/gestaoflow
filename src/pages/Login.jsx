import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Coffee, AlertCircle } from 'lucide-react'
import { Button, Field, Input } from '../components/ui'
import { useAuth } from '../context/AuthProvider'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Login() {
  const { signIn, session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(isSupabaseConfigured ? '' : 'dono@cafe.com')
  const [password, setPassword] = useState(isSupabaseConfigured ? '' : 'cafe123')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) navigate('/', { replace: true })
  }, [session, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(err?.message || 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]">
            <Coffee className="h-5 w-5 text-white" />
          </span>
          <div>
            <div className="font-[Sora] text-lg font-bold leading-tight">GestãoFlow</div>
            <div className="text-xs text-[var(--color-muted)]">Café &amp; Cia</div>
          </div>
        </div>

        <h1 className="text-3xl font-bold">Bem-vindo de volta</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Entre para gerenciar o seu negócio.</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <Field label="E-mail">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="username" />
          </Field>
          <Field label="Senha">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </Field>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Entrar
          </Button>
        </form>

        {!isSupabaseConfigured && (
          <p className="mt-6 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-3 text-center text-xs text-[var(--color-muted)]">
            Modo demo — login já preenchido.<br />
            <span className="text-[var(--color-faint)]">dono@cafe.com / cafe123</span>
          </p>
        )}
      </div>
    </div>
  )
}
