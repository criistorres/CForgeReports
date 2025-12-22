import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PerfilDrawer } from './PerfilDrawer'
import { ModalAlterarSenha } from '@/components/usuarios/ModalAlterarSenha'

export function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
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
      'from-violet-500 to-indigo-500',
      'from-fuchsia-500 to-purple-500',
      'from-purple-600 to-violet-600',
      'from-indigo-500 to-purple-500',
      'from-violet-400 to-purple-400',
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
          flex items-center gap-3 px-2 py-1.5 rounded-2xl transition-all duration-300
          ${isOpen
            ? 'bg-white/10 border-white/10 shadow-lg'
            : 'hover:bg-white/5 border border-transparent hover:border-white/5'
          }
        `}
        aria-label="Menu do usuário"
        aria-expanded={isOpen}
      >
        {/* Avatar */}
        <div className={`
          w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(user.nome)}
          flex items-center justify-center text-white text-sm font-black
          shadow-lg ring-2 ring-white/10 group-hover:ring-white/20 transition-all
        `}>
          {getInitials(user.nome)}
        </div>

        {/* Informações do usuário (desktop) */}
        <div className="hidden sm:block text-left pr-1">
          <p className="text-[13px] font-bold text-white leading-tight">
            {user.nome}
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 leading-tight">
            {user.role === 'ADMIN' ? 'Administrador' : user.role === 'TECNICO' ? 'Técnico' : 'Usuário'}
          </p>
        </div>

        {/* Ícone de chevron */}
        <div className={`p-1 rounded-lg transition-colors ${isOpen ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500'}`}>
          <ChevronDown
            className={`
              w-3.5 h-3.5 transition-transform duration-300
              ${isOpen ? 'rotate-180' : ''}
            `}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-3 w-72 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 p-2"
          role="menu"
        >
          {/* Header do menu com informações do usuário */}
          <div className="px-4 py-6 border-b border-white/5 bg-white/5 rounded-[1.5rem] mb-2">
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`
                w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarColor(user.nome)}
                flex items-center justify-center text-white text-xl font-black
                shadow-2xl ring-4 ring-white/10
              `}>
                {getInitials(user.nome)}
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-white truncate px-2">
                  {user.nome}
                </p>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {user.email}
                </p>
                <div className="mt-4 flex justify-center">
                  <span className={`
                    inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                    ${user.role === 'ADMIN'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : user.role === 'TECNICO'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
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
          <div className="space-y-1">
            <button
              onClick={() => {
                setIsOpen(false)
                setIsProfileOpen(true)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all rounded-xl group"
              role="menuitem"
            >
              <div className="p-1.5 bg-slate-800/50 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <User className="w-4 h-4 group-hover:text-purple-400" />
              </div>
              <span className="font-semibold">Meu Perfil</span>
            </button>

            {/* Configurações - Apenas ADMIN */}
            {user.role === 'ADMIN' && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/configuracoes')
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all rounded-xl group"
                role="menuitem"
              >
                <div className="p-1.5 bg-slate-800/50 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                  <Settings className="w-4 h-4 group-hover:text-amber-400" />
                </div>
                <span className="font-semibold">Configurações</span>
              </button>
            )}

            {/* Divisor */}
            <div className="my-2 border-t border-white/5 mx-2" />

            {/* Botão de sair */}
            <button
              onClick={() => {
                setIsOpen(false)
                logout()
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all rounded-xl group"
              role="menuitem"
            >
              <div className="p-1.5 bg-red-500/5 rounded-lg group-hover:bg-red-500/20 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="font-bold">Sair do Sistema</span>
            </button>
          </div>
        </div>
      )}

      {/* Perfil Drawer */}
      <PerfilDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
      />

      {/* Modal de Alterar Senha */}
      <ModalAlterarSenha
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  )
}

