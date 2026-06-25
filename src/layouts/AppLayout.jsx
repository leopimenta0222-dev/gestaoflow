import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { isSupabaseConfigured } from '../lib/supabase'

const TITLES = {
  '/': 'Dashboard',
  '/produtos': 'Produtos',
  '/vendas': 'Vendas',
  '/vendas/nova': 'Nova venda',
  '/relatorios': 'Relatórios',
}

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'GestãoFlow'

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden lg:block">
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64">
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col">
        <Topbar title={title} onMenu={() => setOpen(true)} />
        {!isSupabaseConfigured && (
          <div className="bg-[var(--color-accent)]/10 px-5 py-1.5 text-center text-xs text-[var(--color-accent)] sm:px-8">
            Modo demonstração — dados de exemplo salvos no seu navegador.
          </div>
        )}
        <main className="flex-1 px-5 py-7 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
