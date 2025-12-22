import { useAuth } from '@/contexts/AuthContext'
import { Drawer } from '@/components/ui/Drawer'
import { User, Mail, Shield, Building2, Edit, Key, Globe, Phone, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
interface PerfilDrawerProps {
  isOpen: boolean
  onClose: () => void
  onOpenPasswordModal: () => void
}

export function PerfilDrawer({ isOpen, onClose, onOpenPasswordModal }: PerfilDrawerProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  // Obter iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Obter cor do avatar baseado no nome
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

  // Obter label do role
  const getRoleLabel = (role: string) => {
    const roles: Record<string, { label: string; color: string; bg: string }> = {
      ADMIN: {
        label: 'Administrador',
        color: 'text-purple-300',
        bg: 'bg-purple-500/20 border-purple-500/30'
      },
      TECNICO: {
        label: 'Técnico',
        color: 'text-purple-300',
        bg: 'bg-purple-500/20 border-purple-500/30'
      },
      USUARIO: {
        label: 'Usuário',
        color: 'text-slate-300',
        bg: 'bg-slate-500/20 border-slate-500/30'
      }
    }
    return roles[role] || roles.USUARIO
  }

  const roleInfo = getRoleLabel(user.role)

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Meu Perfil" side="right">
      <div className="p-6 space-y-6">
        {/* Card de Perfil */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center mb-6">
            {/* Avatar Grande */}
            <div className={`
            w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarColor(user.nome)}
            flex items-center justify-center text-white text-2xl font-bold
            shadow-xl ring-4 ring-slate-700/50 mb-4
          `}>
              {getInitials(user.nome)}
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{user.nome}</h2>
            <span className={`
            inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border
            ${roleInfo.bg} ${roleInfo.color}
          `}>
              <Shield className="w-3 h-3 mr-1.5" />
              {roleInfo.label}
            </span>
          </div>

          {/* Informações de Contato e Profissionais */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <p className="text-sm font-medium text-white truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-1">Telefone</p>
                <p className="text-sm font-medium text-white truncate">{user.telefone || 'Não informado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-1">Cargo</p>
                <p className="text-sm font-medium text-white truncate">{user.cargo_nome || 'Não informado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-1">Empresa {user.departamento_nome ? '/ Depto' : ''}</p>
                <p className="text-sm font-medium text-white truncate">
                  {user.empresa_nome} {user.departamento_nome ? `(${user.departamento_nome})` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Informações Detalhadas */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-400" />
            Informações Pessoais
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <p className="text-xs text-slate-500 mb-1">Nome Completo</p>
              <p className="text-sm font-medium text-white">{user.nome}</p>
            </div>

            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <p className="text-xs text-slate-500 mb-1">ID do Usuário</p>
              <p className="text-sm font-medium text-white font-mono text-xs break-all">{user.id}</p>
            </div>
          </div>
        </div>

        {/* Card de Segurança */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-primary-400" />
            Segurança
          </h3>

          <button
            onClick={() => {
              onClose()
              onOpenPasswordModal()
            }}
            className="w-full flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-primary-500/50 hover:bg-slate-900/70 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                <Key className="w-5 h-5 text-slate-400 group-hover:text-primary-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Alterar Senha</p>
                <p className="text-xs text-slate-400">Atualize sua senha regularmente</p>
              </div>
            </div>
            <Edit className="w-4 h-4 text-slate-400 group-hover:text-primary-400" />
          </button>
        </div>

        {/* Card de Status */}
        <div className="bg-gradient-to-br from-primary-500/10 to-primary-600/5 border border-primary-500/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Status da Conta</p>
              <p className="text-sm font-semibold text-white">Ativa</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Conta verificada e ativa</span>
          </div>
        </div>

        {/* Card de Permissões */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary-400" />
            Permissões
          </h4>
          <div className="space-y-2">
            {user.role === 'ADMIN' && (
              <>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Gerenciar usuários</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Criar conexões</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Criar relatórios</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Executar relatórios</span>
                </div>
              </>
            )}
            {user.role === 'TECNICO' && (
              <>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Criar conexões</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Criar relatórios</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Executar relatórios</span>
                </div>
              </>
            )}
            {user.role === 'USUARIO' && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>Executar relatórios</span>
              </div>
            )}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
          <h4 className="text-sm font-semibold text-white mb-4">Ações Rápidas</h4>
          <div className="space-y-2">
            <button
              onClick={() => {
                onClose()
                navigate('/dashboard')
              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
            >
              Ir para Dashboard
            </button>
            {['ADMIN', 'TECNICO'].includes(user.role) && (
              <button
                onClick={() => {
                  onClose()
                  navigate('/relatorios')
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
              >
                Ver Relatórios
              </button>
            )}
            {user.role === 'ADMIN' && (
              <button
                onClick={() => {
                  onClose()
                  navigate('/usuarios')
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
              >
                Gerenciar Usuários
              </button>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  )
}



