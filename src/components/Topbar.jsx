import { Menu, Sun, Moon, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeProvider'
import { useAuth } from '../context/AuthProvider'

export default function Topbar({ title, onMenu }) {
  const { theme, toggle } = useTheme()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-bg)]/80 px-5 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} aria-label="Menu" className="text-[var(--color-muted)] lg:hidden">
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-[Sora] text-lg font-semibold">{title}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggle}
          aria-label="Alternar tema"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button
          onClick={handleLogout}
          aria-label="Sair"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
