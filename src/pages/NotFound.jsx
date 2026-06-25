import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--color-accent)]">Erro 404</p>
      <h1 className="mt-3 text-6xl font-bold">Página não encontrada</h1>
      <p className="mt-2 max-w-sm text-[var(--color-muted)]">Essa página não existe ou foi movida.</p>
      <Button as={Link} to="/" className="mt-8">
        Voltar ao painel
      </Button>
    </main>
  )
}
