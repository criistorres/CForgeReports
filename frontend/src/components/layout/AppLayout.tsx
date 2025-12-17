import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface AppLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
}

export function AppLayout({ children, sidebar }: AppLayoutProps) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-forge-bg">
      {/* Header */}
      <header className="h-16 border-b border-primary-200 glass-card sticky top-0 z-50">
        <div className="h-full flex items-center justify-between px-6">
          <Link to="/dashboard">
            <h1 className="text-xl font-bold gradient-text">ForgeReports</h1>
          </Link>

          {/* Navigation */}
          {user && (
            <div className="flex items-center gap-6">
              <nav className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/conexoes"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Conexões
                </Link>
                <Link
                  to="/relatorios"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Relatórios
                </Link>
                <Link
                  to="/historico"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Histórico
                </Link>
              </nav>

              <div className="flex items-center gap-3 border-l border-primary-200 pl-6">
                <div className="text-right">
                  <p className="text-sm text-white">{user.nome}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex">
        {/* Sidebar (opcional) */}
        {sidebar && (
          <aside className="w-64 min-h-[calc(100vh-4rem)] border-r border-primary-200 p-4">
            {sidebar}
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
