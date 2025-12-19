import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LayoutDashboard, Database, FileText, Clock, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { ForgeLogo } from './ForgeLogo'
import { UserMenu } from './UserMenu'

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
        flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all duration-200 relative
        ${isActive
          ? 'text-white bg-gradient-to-r from-primary-500/20 to-primary-600/10 border border-primary-500/30'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        }
      `}
    >
      <span className={isActive ? 'text-primary-400' : ''}>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary-400 to-primary-600 rounded-r-full" />
      )}
    </Link>
  )
}

export function AppLayout({ children, sidebar }: AppLayoutProps) {
  const { user } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-forge-bg">
      {/* Header */}
      <header className="h-16 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="h-full flex items-center justify-between px-4 lg:px-6 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-6 lg:gap-8 flex-1">
            {/* Logo */}
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <ForgeLogo size={40} showText={true} />
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                <NavLink
                  to="/dashboard"
                  icon={<LayoutDashboard className="w-4 h-4" />}
                  label="Dashboard"
                  isActive={isActivePath('/dashboard')}
                />

                {['ADMIN', 'TECNICO'].includes(user.role) && (
                  <>
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
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <NavLink
                    to="/usuarios"
                    icon={<User className="w-4 h-4" />}
                    label="Usuários"
                    isActive={isActivePath('/usuarios')}
                  />
                )}
              </nav>
            )}

            {/* Mobile menu button */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            )}
          </div>

          {/* User Menu */}
          {user && <UserMenu />}
        </div>

        {/* Mobile Navigation Menu */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
            <nav className="flex flex-col p-4 gap-2">
              <NavLink
                to="/dashboard"
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Dashboard"
                isActive={isActivePath('/dashboard')}
              />

              {['ADMIN', 'TECNICO'].includes(user.role) && (
                <>
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
                </>
              )}

              {user.role === 'ADMIN' && (
                <NavLink
                  to="/usuarios"
                  icon={<User className="w-4 h-4" />}
                  label="Usuários"
                  isActive={isActivePath('/usuarios')}
                />
              )}

              {/* Mobile user menu */}
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <UserMenu />
              </div>
            </nav>
          </div>
        )}
      </header>

      <div className="flex overflow-hidden">
        {/* Sidebar (opcional) */}
        {sidebar && (
          <aside className="w-64 min-h-[calc(100vh-4rem)] border-r border-slate-700/50 p-4 bg-slate-900/30">
            {sidebar}
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
