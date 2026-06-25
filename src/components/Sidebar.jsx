import { NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Coffee } from 'lucide-react'
import { cx } from './ui'

const LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/vendas', label: 'Vendas', icon: ShoppingCart },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
]

export default function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)]">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]">
          <Coffee className="h-5 w-5 text-white" />
        </span>
        <span className="font-[Sora] text-lg font-bold">Café &amp; Cia</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-accent)] text-white shadow-sm'
                  : 'text-[var(--color-sidebar-muted)] hover:bg-white/5 hover:text-[var(--color-sidebar-text)]',
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 text-xs text-[var(--color-sidebar-muted)]">GestãoFlow · v1.0</div>
    </div>
  )
}
