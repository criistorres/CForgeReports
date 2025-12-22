import { useAuth } from '@/contexts/AuthContext'
import { Drawer } from '@/components/ui/Drawer'
import {
  User,
  Mail,
  Shield,
  Building2,
  Edit,
  Key,
  Phone,
  Briefcase,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  Users as UsersIcon,
  FileText
} from 'lucide-react'
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
    ]
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const isStaff = ['ADMIN', 'TECNICO'].includes(user.role)

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Meu Perfil" side="right">
      <div className="flex flex-col h-full bg-slate-950/20">
        {/* Header/Avatar Section */}
        <div className="relative pt-12 pb-8 px-6 text-center border-b border-white/5 overflow-hidden">
          {/* Background Decoration */}
          <div className={`absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br ${getAvatarColor(user.nome)} opacity-10 blur-3xl rounded-full`} />
          <div className={`absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-br ${getAvatarColor(user.nome)} opacity-10 blur-3xl rounded-full`} />

          <div className="relative z-10">
            <div className="inline-flex relative mb-4">
              <div className={`
                    w-24 h-24 rounded-[2rem] bg-gradient-to-br ${getAvatarColor(user.nome)}
                    flex items-center justify-center text-white text-3xl font-black
                    shadow-2xl ring-4 ring-white/10 rotate-3 transition-transform hover:rotate-0
                `}>
                {getInitials(user.nome)}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-900 border-2 border-slate-950 p-2 rounded-xl text-purple-400 shadow-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">{user.nome}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className={`
                    px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]
                    ${user.role === 'ADMIN'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}
                `}>
                {user.role === 'ADMIN' ? 'Administrador' : user.role === 'TECNICO' ? 'Técnico' : 'Usuário Padrão'}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto premium-scrollbar p-6 space-y-8">

          {/* Informações Profissionais */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Informações Corporativas</h3>
            <div className="grid grid-cols-1 gap-3">
              <ProfileItem icon={<Mail />} label="Email Principal" value={user.email} />
              <ProfileItem icon={<Phone />} label="Telefone" value={user.telefone || 'Não informado'} />
              <ProfileItem icon={<Briefcase />} label="Cargo / Função" value={user.cargo_nome || 'Não definido'} />
              <ProfileItem icon={<Building2 />} label="Unidade / Departamento" value={`${user.empresa_nome}${user.departamento_nome ? ` ( ${user.departamento_nome} )` : ''}`} />
            </div>
          </section>

          {/* Segurança */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Acesso e Segurança</h3>
            <button
              onClick={() => { onClose(); onOpenPasswordModal(); }}
              className="w-full flex items-center justify-between p-4 bg-slate-900/40 border border-white/5 rounded-2xl hover:bg-white/5 hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                  <Key className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Alterar Minha Senha</p>
                  <p className="text-[11px] text-slate-500">Última alteração recomendada há 90 dias</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>
          </section>

          {/* Somente para STAFF / TECNICO */}
          {isStaff && (
            <section className="space-y-4">
              <h3 className="text-[11px] font-black text-amber-500/80 uppercase tracking-widest pl-1">Identificadores Técnicos</h3>
              <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 space-y-4">
                <div>
                  <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">UUID Global do Usuário</p>
                  <p className="font-mono text-[10px] text-slate-400 break-all bg-black/20 p-2 rounded-lg">{user.id}</p>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Sessão Ativa</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Verificada
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Links Rápidos */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Acesso Rápido</h3>
            <div className="grid grid-cols-1 gap-2">
              <QuickLink
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Dashboard Principal"
                onClick={() => { onClose(); navigate('/dashboard'); }}
              />
              {isStaff && (
                <>
                  <QuickLink
                    icon={<FileText className="w-4 h-4" />}
                    label="Catálogo de Relatórios"
                    onClick={() => { onClose(); navigate('/relatorios'); }}
                  />
                  <QuickLink
                    icon={<UsersIcon className="w-4 h-4" />}
                    label="Central de Usuários"
                    onClick={() => { onClose(); navigate('/usuarios'); }}
                  />
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </Drawer>
  )
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 p-3.5 bg-slate-900/30 border border-white/5 rounded-2xl group hover:border-white/10 transition-colors">
      <div className="p-2.5 bg-slate-800/50 rounded-xl text-slate-500 group-hover:text-slate-300 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-200 truncate">{value}</p>
      </div>
    </div>
  )
}

function QuickLink({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/20 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all group"
    >
      <div className="flex items-center gap-3">
        <span className="opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      </div>
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
    </button>
  )
}
