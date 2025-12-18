import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LayoutDashboard, Database, FileText, Clock, LogOut, User } from 'lucide-react'

interface AppLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
}

interface NavLinkProps {
  to: string
  icon: ReactNode
  label: string
  isActive: boolean
}

function NavLink({ to, icon, label, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
        ${isActive
          ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
        }
      `}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

export function AppLayout({ children, sidebar }: AppLayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-forge-bg">
      {/* Header */}
      <header className="h-16 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">FR</span>
              </div>
              <h1 className="text-xl font-bold text-white">
                Forge<span className="text-primary-400">Reports</span>
              </h1>
            </Link>

            {/* Navigation */}
            {user && (
              <nav className="flex items-center gap-2">
                <NavLink
                  to="/dashboard"
                  icon={<LayoutDashboard className="w-4 h-4" />}
                  label="Dashboard"
                  isActive={isActivePath('/dashboard')}
                />
                <NavLink
                  to="/conexoes"
                  icon={<Database className="w-4 h-4" />}
                  label="Conexões"
                  isActive={isActivePath('/conexoes')}
                />
                <NavLink
                  to="/relatorios"
                  icon={<FileText className="w-4 h-4" />}
                  label="Relatórios"
                  isActive={isActivePath('/relatorios')}
                />
                <NavLink
                  to="/historico"
                  icon={<Clock className="w-4 h-4" />}
                  label="Histórico"
                  isActive={isActivePath('/historico')}
                />
              </nav>
            )}
          </div>

          {/* User section */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.nome}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex">
        {/* Sidebar (opcional) */}
        {sidebar && (
          <aside className="w-64 min-h-[calc(100vh-4rem)] border-r border-slate-700/50 p-4 bg-slate-900/30">
            {sidebar}
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
