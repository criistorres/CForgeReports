import { useState, useRef, useEffect } from 'react'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PerfilDrawer } from './PerfilDrawer'

export function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Obter iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Obter cor do avatar baseado no nome (hash simples)
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-green-500',
    ]
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      {/* Botão do usuário */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
          ${isOpen
            ? 'bg-slate-800/80 border border-slate-700/50'
            : 'hover:bg-slate-800/60 border border-transparent'
          }
        `}
        aria-label="Menu do usuário"
        aria-expanded={isOpen}
      >
        {/* Avatar */}
        <div className={`
          w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(user.nome)}
          flex items-center justify-center text-white text-sm font-semibold
          shadow-lg ring-2 ring-slate-700/50
        `}>
          {getInitials(user.nome)}
        </div>

        {/* Informações do usuário (desktop) */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-white leading-tight">
            {user.nome}
          </p>
          <p className="text-xs text-slate-400 leading-tight">
            {user.role === 'ADMIN' ? 'Administrador' : user.role === 'TECNICO' ? 'Técnico' : 'Usuário'}
          </p>
        </div>

        {/* Ícone de chevron */}
        <ChevronDown
          className={`
            w-4 h-4 text-slate-400 transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-up"
          role="menu"
        >
          {/* Header do menu com informações do usuário */}
          <div className="px-4 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <div className="flex items-center gap-3">
              <div className={`
                w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(user.nome)}
                flex items-center justify-center text-white text-base font-semibold
                shadow-lg ring-2 ring-primary-500/20
              `}>
                {getInitials(user.nome)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.nome}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user.email}
                </p>
                <div className="mt-1">
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                    ${user.role === 'ADMIN'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : user.role === 'TECNICO'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                    }
                  `}>
                    {user.role === 'ADMIN' ? 'Administrador' : user.role === 'TECNICO' ? 'Técnico' : 'Usuário'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Itens do menu */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false)
                setIsProfileOpen(true)
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
              role="menuitem"
            >
              <User className="w-4 h-4" />
              <span>Meu Perfil</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                // TODO: Navegar para configurações quando implementado
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
              role="menuitem"
            >
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </button>

            {/* Divisor */}
            <div className="my-2 border-t border-slate-700/50" />

            {/* Botão de sair */}
            <button
              onClick={() => {
                setIsOpen(false)
                logout()
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}

      {/* Perfil Drawer */}
      <PerfilDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  )
}

