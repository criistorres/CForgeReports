import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LayoutDashboard, Database, FileText, Clock, User, Menu, X, CalendarClock } from 'lucide-react'
import { useState } from 'react'
import { ForgeLogo } from './ForgeLogo'
import { UserMenu } from './UserMenu'
import '@/styles/dashboard-redesign.css'

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
        flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 relative group
        ${isActive
          ? 'text-white bg-purple-500/15 border border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
        }
      `}
    >
      <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
      {isActive && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-purple-500 rounded-full blur-[2px] shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
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
    <div className="min-h-screen relative overflow-hidden flex flex-col font-sans antialiased text-slate-200">
      {/* Dynamic Background */}
      <div className="dashboard-bg">
        <div className="dashboard-orb orb-1"></div>
        <div className="dashboard-orb orb-2"></div>
        <div className="dashboard-orb orb-3"></div>
      </div>

      {/* Header */}
      <header className="h-16 forge-glass-header sticky top-0 z-50 shadow-lg shadow-black/40">
        <div className="h-full flex items-center justify-between px-4 lg:px-8 max-w-[2200px] mx-auto">
          <div className="flex items-center gap-10 flex-1">
            {/* Logo */}
            <Link
              to="/dashboard"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <ForgeLogo size={42} showText={true} />
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <nav className="hidden md:flex items-center gap-2">
                <NavLink
                  to="/dashboard"
                  icon={<LayoutDashboard className="w-[18px] h-[18px]" />}
                  label="Dashboard"
                  isActive={isActivePath('/dashboard')}
                />

                {['ADMIN', 'TECNICO'].includes(user.role) && (
                  <>
                    <NavLink
                      to="/conexoes"
                      icon={<Database className="w-[18px] h-[18px]" />}
                      label="Conexões"
                      isActive={isActivePath('/conexoes')}
                    />
                    <NavLink
                      to="/relatorios"
                      icon={<FileText className="w-[18px] h-[18px]" />}
                      label="Relatórios"
                      isActive={isActivePath('/relatorios')}
                    />
                    <NavLink
                      to="/agendamentos"
                      icon={<CalendarClock className="w-[18px] h-[18px]" />}
                      label="Agendamentos"
                      isActive={isActivePath('/agendamentos')}
                    />
                    <NavLink
                      to="/historico"
                      icon={<Clock className="w-[18px] h-[18px]" />}
                      label="Histórico"
                      isActive={isActivePath('/historico')}
                    />
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <NavLink
                    to="/usuarios"
                    icon={<User className="w-[18px] h-[18px]" />}
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
                className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
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
          {user && (
            <div className="flex items-center gap-4">
              <UserMenu />
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-slate-900/95 backdrop-blur-2xl">
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
                    to="/agendamentos"
                    icon={<CalendarClock className="w-4 h-4" />}
                    label="Agendamentos"
                    isActive={isActivePath('/agendamentos')}
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
              <div className="mt-4 pt-4 border-t border-white/5">
                <UserMenu />
              </div>
            </nav>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar (opcional) */}
        {sidebar && (
          <aside className="w-72 flex-shrink-0 forge-glass-sidebar hidden lg:block overflow-y-auto premium-scrollbar">
            {sidebar}
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto relative premium-scrollbar">
          <div className="p-6 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
