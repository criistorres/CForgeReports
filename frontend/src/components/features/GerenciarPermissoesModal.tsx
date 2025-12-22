import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Shield, Plus, Trash2, Info, Loader2, User, Mail, ShieldCheck, Search, Eye, Download, Users, X, ChevronDown, Sparkles, Check, UserPlus, ArrowUpDown, AlertCircle } from 'lucide-react'
import api from '@/services/api'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/utils/errorMessages'

interface Permissao {
    id: string
    usuario_id: string
    usuario_nome: string
    usuario_email: string
    nivel: 'VISUALIZAR' | 'EXPORTAR'
}

interface Usuario {
    id: string
    nome: string
    email: string
    role: string
}

interface GerenciarPermissoesModalProps {
    isOpen: boolean
    onClose: () => void
    relatorioId: string | null
    relatorioNome: string
}

// Componente de Avatar com iniciais
function UserAvatar({ nome, className = "", size = "md" }: { nome: string; className?: string; size?: "sm" | "md" | "lg" }) {
    const initials = nome
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    // Gerar cor baseada no nome
    const colors = [
        'from-purple-500 to-indigo-600',
        'from-pink-500 to-rose-600',
        'from-blue-500 to-cyan-600',
        'from-emerald-500 to-teal-600',
        'from-orange-500 to-amber-600',
        'from-violet-500 to-fuchsia-600',
    ]
    const colorIndex = nome.charCodeAt(0) % colors.length

    const sizeClasses = {
        sm: 'w-8 h-8 text-[10px]',
        md: 'w-10 h-10 text-xs',
        lg: 'w-12 h-12 text-sm'
    }

    return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-black shadow-lg ${className}`}>
            {initials}
        </div>
    )
}

// Badge de nível de acesso
function NivelBadge({ nivel, size = 'md', interactive = false, onClick }: {
    nivel: 'VISUALIZAR' | 'EXPORTAR';
    size?: 'sm' | 'md';
    interactive?: boolean;
    onClick?: () => void;
}) {
    const isExportar = nivel === 'EXPORTAR'
    const sizeClasses = size === 'sm'
        ? 'text-[9px] px-2 py-1 gap-1'
        : 'text-[10px] px-2.5 py-1 gap-1.5'

    return (
        <button
            onClick={onClick}
            disabled={!interactive}
            className={`
                inline-flex items-center font-bold rounded-lg border tracking-wide ${sizeClasses}
                ${isExportar
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/30'
                }
                ${interactive ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}
            `}
        >
            {isExportar ? <Download className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {nivel}
        </button>
    )
}

// Componente de item de usuário na lista - memoizado para performance
const PermissaoItem = ({
    permissao,
    onRemover,
    salvando,
    index
}: {
    permissao: Permissao;
    onRemover: (id: string) => void;
    salvando: boolean;
    index: number;
}) => {
    return (
        <div
            className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 hover:border-purple-500/20 rounded-xl transition-all group hover:bg-white/[0.04] animate-in fade-in slide-in-from-bottom-1"
            style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
        >
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <UserAvatar nome={permissao.usuario_nome} size="sm" />
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                        {permissao.usuario_nome}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{permissao.usuario_email}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
                <NivelBadge nivel={permissao.nivel} size="sm" />
                <button
                    onClick={() => onRemover(permissao.usuario_id)}
                    disabled={salvando}
                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all border border-red-500/20 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 disabled:opacity-50 opacity-0 group-hover:opacity-100"
                    title="Remover acesso"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

// Componente de usuário disponível para selecionar
const UsuarioOption = ({
    usuario,
    isSelected,
    onSelect
}: {
    usuario: Usuario;
    isSelected: boolean;
    onSelect: (id: string) => void;
}) => {
    return (
        <button
            onClick={() => onSelect(usuario.id)}
            className={`w-full flex items-center gap-3 p-3 hover:bg-purple-500/10 transition-colors rounded-lg ${isSelected ? 'bg-purple-500/15 ring-1 ring-purple-500/30' : ''}`}
        >
            <UserAvatar nome={usuario.nome} size="sm" />
            <div className="text-left min-w-0 flex-1">
                <div className="text-sm font-semibold text-white truncate">{usuario.nome}</div>
                <div className="text-[11px] text-slate-500 truncate">{usuario.email}</div>
            </div>
            {isSelected && (
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
            )}
        </button>
    )
}

export function GerenciarPermissoesModal({
    isOpen,
    onClose,
    relatorioId,
    relatorioNome
}: GerenciarPermissoesModalProps) {
    const { showToast } = useToast()
    const [permissoes, setPermissoes] = useState<Permissao[]>([])
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [usuariosSelecionados, setUsuariosSelecionados] = useState<string[]>([])
    const [novoNivel, setNovoNivel] = useState<'VISUALIZAR' | 'EXPORTAR'>('VISUALIZAR')
    const [loading, setLoading] = useState(true)
    const [salvando, setSalvando] = useState(false)
    const [buscaUsuario, setBuscaUsuario] = useState('')
    const [buscaPermissao, setBuscaPermissao] = useState('')
    const [dropdownAberto, setDropdownAberto] = useState(false)
    const [filtroNivel, setFiltroNivel] = useState<'TODOS' | 'VISUALIZAR' | 'EXPORTAR'>('TODOS')
    const [ordenacao, setOrdenacao] = useState<'nome' | 'nivel'>('nome')
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen && relatorioId) {
            carregarDados()
            // Reset states
            setUsuariosSelecionados([])
            setBuscaUsuario('')
            setBuscaPermissao('')
            setFiltroNivel('TODOS')
        }
    }, [isOpen, relatorioId])

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownAberto(false)
            }
        }
        if (dropdownAberto) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dropdownAberto])

    const carregarDados = async () => {
        if (!relatorioId) return
        try {
            setLoading(true)
            const [permRes, usersRes] = await Promise.all([
                api.get(`/relatorios/${relatorioId}/permissoes/`),
                api.get('/usuarios/')
            ])
            setPermissoes(permRes.data)
            setUsuarios(usersRes.data.filter((u: Usuario) => u.role === 'USUARIO'))
        } catch (error) {
            console.error('Erro ao carregar permissões:', error)
            const mensagem = getErrorMessage(error)
            showToast(mensagem, 'error')
        } finally {
            setLoading(false)
        }
    }

    const toggleUsuarioSelecionado = useCallback((usuarioId: string) => {
        setUsuariosSelecionados(prev =>
            prev.includes(usuarioId)
                ? prev.filter(id => id !== usuarioId)
                : [...prev, usuarioId]
        )
    }, [])

    const handleAdicionarMultiplos = async () => {
        if (!relatorioId || usuariosSelecionados.length === 0) return

        try {
            setSalvando(true)
            // Adicionar todos os usuários selecionados
            await Promise.all(
                usuariosSelecionados.map(usuarioId =>
                    api.post(`/relatorios/${relatorioId}/permissoes/`, {
                        usuario_id: usuarioId,
                        nivel: novoNivel
                    })
                )
            )
            await carregarDados()
            setUsuariosSelecionados([])
            setNovoNivel('VISUALIZAR')
            setBuscaUsuario('')
            setDropdownAberto(false)
            showToast(`${usuariosSelecionados.length} permissão(ões) adicionada(s) com sucesso`, 'success')
        } catch (error) {
            console.error('Erro ao adicionar permissões:', error)
            const mensagem = getErrorMessage(error)
            showToast(mensagem, 'error')
        } finally {
            setSalvando(false)
        }
    }

    const handleRemover = async (usuarioId: string) => {
        if (!relatorioId) return

        try {
            setSalvando(true)
            await api.delete(`/relatorios/${relatorioId}/permissoes/`, {
                data: { usuario_id: usuarioId }
            })
            setPermissoes(prev => prev.filter(p => p.usuario_id !== usuarioId))
            showToast('Permissão removida com sucesso', 'success')
        } catch (error) {
            console.error('Erro ao remover permissão:', error)
            const mensagem = getErrorMessage(error)
            showToast(mensagem, 'error')
        } finally {
            setSalvando(false)
        }
    }

    // Usuários disponíveis filtrados
    const usuariosDisponiveis = useMemo(() => {
        return usuarios
            .filter(u => !permissoes.find(p => p.usuario_id === u.id))
            .filter(u =>
                buscaUsuario === '' ||
                u.nome.toLowerCase().includes(buscaUsuario.toLowerCase()) ||
                u.email.toLowerCase().includes(buscaUsuario.toLowerCase())
            )
            .sort((a, b) => a.nome.localeCompare(b.nome))
    }, [usuarios, permissoes, buscaUsuario])

    // Permissões filtradas e ordenadas
    const permissoesFiltradas = useMemo(() => {
        let result = permissoes

        // Filtrar por busca
        if (buscaPermissao) {
            result = result.filter(p =>
                p.usuario_nome.toLowerCase().includes(buscaPermissao.toLowerCase()) ||
                p.usuario_email.toLowerCase().includes(buscaPermissao.toLowerCase())
            )
        }

        // Filtrar por nível
        if (filtroNivel !== 'TODOS') {
            result = result.filter(p => p.nivel === filtroNivel)
        }

        // Ordenar
        return result.sort((a, b) => {
            if (ordenacao === 'nome') {
                return a.usuario_nome.localeCompare(b.usuario_nome)
            }
            return a.nivel.localeCompare(b.nivel)
        })
    }, [permissoes, buscaPermissao, filtroNivel, ordenacao])

    // Estatísticas
    const stats = useMemo(() => ({
        total: permissoes.length,
        visualizar: permissoes.filter(p => p.nivel === 'VISUALIZAR').length,
        exportar: permissoes.filter(p => p.nivel === 'EXPORTAR').length,
    }), [permissoes])

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} size="full">
            <DialogContent className="w-full h-full p-0 overflow-hidden flex flex-col">
                {/* Header Compacto */}
                <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-slate-900 via-slate-900/95 to-purple-900/20 shrink-0">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                                        <Sparkles className="w-2.5 h-2.5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-black text-white tracking-tight">
                                        Gerenciar Permissões
                                    </DialogTitle>
                                    <p className="text-xs text-slate-400 mt-0.5 font-medium flex items-center gap-2">
                                        <span className="text-slate-500">Relatório:</span>
                                        <span className="text-purple-400 font-bold uppercase tracking-tight bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 max-w-[300px] truncate">
                                            {relatorioNome}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Stats Mini */}
                            {!loading && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                                        <Users className="w-4 h-4 text-purple-400" />
                                        <span className="text-sm font-bold text-white">{stats.total}</span>
                                        <span className="text-[10px] text-slate-500 uppercase">Total</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                                        <Eye className="w-4 h-4 text-indigo-400" />
                                        <span className="text-sm font-bold text-white">{stats.visualizar}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                                        <Download className="w-4 h-4 text-emerald-400" />
                                        <span className="text-sm font-bold text-white">{stats.exportar}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogHeader>
                </div>

                {/* Conteúdo Principal - Layout de 2 Colunas */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Coluna Esquerda - Adicionar Novo Acesso */}
                    <div className="w-[380px] shrink-0 p-5 border-r border-white/5 overflow-y-auto premium-scrollbar bg-white/[0.01] flex flex-col">
                        <div className="space-y-4 flex-1">
                            {/* Info Alert Compacto */}
                            <div className="flex items-start gap-2.5 p-3 bg-gradient-to-r from-purple-500/5 to-transparent border border-purple-500/10 rounded-xl">
                                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                <div className="text-[12px] text-slate-400 leading-relaxed">
                                    <span className="text-purple-400 font-semibold">Administradores</span> e{' '}
                                    <span className="text-blue-400 font-semibold">Técnicos</span> têm acesso automático.
                                    Conceda acesso apenas para <span className="text-white font-semibold">Usuários Comuns</span>.
                                </div>
                            </div>

                            {/* Título da Seção */}
                            <div className="flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-purple-400" />
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Conceder Novo Acesso
                                </h4>
                                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                            </div>

                            {/* Dropdown de Seleção Múltipla */}
                            <div className="space-y-2" ref={dropdownRef}>
                                <label className="text-xs font-medium text-slate-400">Selecionar Usuários</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownAberto(!dropdownAberto)}
                                        disabled={loading || salvando}
                                        className="w-full flex items-center justify-between gap-2 p-3 bg-slate-800/50 border border-white/10 rounded-xl text-left hover:border-purple-500/30 transition-all disabled:opacity-50 group"
                                    >
                                        {usuariosSelecionados.length > 0 ? (
                                            <div className="flex items-center gap-2 truncate">
                                                <div className="flex -space-x-2">
                                                    {usuariosSelecionados.slice(0, 3).map(id => {
                                                        const user = usuarios.find(u => u.id === id)
                                                        return user ? (
                                                            <UserAvatar key={id} nome={user.nome} size="sm" className="ring-2 ring-slate-800" />
                                                        ) : null
                                                    })}
                                                </div>
                                                <span className="text-sm font-medium text-white">
                                                    {usuariosSelecionados.length} selecionado{usuariosSelecionados.length > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-500">
                                                {usuariosDisponiveis.length === 0
                                                    ? 'Todos os usuários já têm acesso'
                                                    : 'Clique para selecionar usuários...'}
                                            </span>
                                        )}
                                        <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-all ${dropdownAberto ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {dropdownAberto && (
                                        <div className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                            {/* Campo de Busca */}
                                            <div className="p-3 border-b border-white/5">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar por nome ou email..."
                                                        value={buscaUsuario}
                                                        onChange={(e) => setBuscaUsuario(e.target.value)}
                                                        className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-white/5 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
                                                        autoFocus
                                                    />
                                                    {buscaUsuario && (
                                                        <button
                                                            onClick={() => setBuscaUsuario('')}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                                                        >
                                                            <X className="w-3 h-3 text-slate-400" />
                                                        </button>
                                                    )}
                                                </div>
                                                {usuariosSelecionados.length > 0 && (
                                                    <div className="flex items-center justify-between mt-2 text-[11px]">
                                                        <span className="text-slate-400">
                                                            {usuariosSelecionados.length} selecionado{usuariosSelecionados.length > 1 ? 's' : ''}
                                                        </span>
                                                        <button
                                                            onClick={() => setUsuariosSelecionados([])}
                                                            className="text-purple-400 hover:text-purple-300"
                                                        >
                                                            Limpar seleção
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Lista de Usuários com scroll virtual para muitos itens */}
                                            <div className="max-h-[280px] overflow-y-auto premium-scrollbar p-2">
                                                {usuariosDisponiveis.length === 0 ? (
                                                    <div className="p-6 text-center">
                                                        <User className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                                        <p className="text-xs text-slate-500 font-medium">
                                                            {buscaUsuario ? 'Nenhum usuário encontrado' : 'Todos os usuários já têm acesso'}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        {usuariosDisponiveis.map(u => (
                                                            <UsuarioOption
                                                                key={u.id}
                                                                usuario={u}
                                                                isSelected={usuariosSelecionados.includes(u.id)}
                                                                onSelect={toggleUsuarioSelecionado}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer do Dropdown */}
                                            {usuariosDisponiveis.length > 0 && (
                                                <div className="p-2 border-t border-white/5 bg-slate-900/50">
                                                    <div className="text-[10px] text-slate-500 text-center">
                                                        {usuariosDisponiveis.length} usuário{usuariosDisponiveis.length > 1 ? 's' : ''} disponíve{usuariosDisponiveis.length > 1 ? 'is' : 'l'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Seleção de Nível */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400">Nível de Acesso</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setNovoNivel('VISUALIZAR')}
                                        className={`p-3 rounded-xl border transition-all ${novoNivel === 'VISUALIZAR'
                                            ? 'bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <Eye className={`w-5 h-5 mx-auto mb-1.5 ${novoNivel === 'VISUALIZAR' ? 'text-indigo-400' : 'text-slate-500'}`} />
                                        <div className={`text-xs font-bold ${novoNivel === 'VISUALIZAR' ? 'text-indigo-400' : 'text-slate-400'}`}>
                                            Visualizar
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">Ver dados em tela</div>
                                    </button>
                                    <button
                                        onClick={() => setNovoNivel('EXPORTAR')}
                                        className={`p-3 rounded-xl border transition-all ${novoNivel === 'EXPORTAR'
                                            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <Download className={`w-5 h-5 mx-auto mb-1.5 ${novoNivel === 'EXPORTAR' ? 'text-emerald-400' : 'text-slate-500'}`} />
                                        <div className={`text-xs font-bold ${novoNivel === 'EXPORTAR' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                            Exportar
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">Baixar em Excel</div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Botão Adicionar - fixo no final */}
                        <div className="pt-4 mt-auto">
                            <Button
                                onClick={handleAdicionarMultiplos}
                                disabled={usuariosSelecionados.length === 0 || salvando}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-11 rounded-xl transition-all active:scale-[0.98] text-sm shadow-xl shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {salvando ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Conceder Acesso
                                        {usuariosSelecionados.length > 0 && (
                                            <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">
                                                {usuariosSelecionados.length}
                                            </span>
                                        )}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Coluna Direita - Lista de Permissões */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        {/* Header da Lista com Filtros */}
                        <div className="p-4 border-b border-white/5 shrink-0 bg-white/[0.01]">
                            <div className="flex items-center justify-between gap-4">
                                {/* Busca */}
                                <div className="flex-1 relative max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Buscar na lista..."
                                        value={buscaPermissao}
                                        onChange={(e) => setBuscaPermissao(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-800/30 border border-white/5 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/30 transition-colors"
                                    />
                                    {buscaPermissao && (
                                        <button
                                            onClick={() => setBuscaPermissao('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                                        >
                                            <X className="w-3 h-3 text-slate-400" />
                                        </button>
                                    )}
                                </div>

                                {/* Filtros */}
                                <div className="flex items-center gap-2">
                                    {/* Filtro por Nível */}
                                    <div className="flex items-center gap-1 p-1 bg-slate-800/30 rounded-lg border border-white/5">
                                        <button
                                            onClick={() => setFiltroNivel('TODOS')}
                                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${filtroNivel === 'TODOS'
                                                ? 'bg-purple-500/20 text-purple-400'
                                                : 'text-slate-500 hover:text-slate-300'
                                                }`}
                                        >
                                            Todos
                                        </button>
                                        <button
                                            onClick={() => setFiltroNivel('VISUALIZAR')}
                                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 ${filtroNivel === 'VISUALIZAR'
                                                ? 'bg-indigo-500/20 text-indigo-400'
                                                : 'text-slate-500 hover:text-slate-300'
                                                }`}
                                        >
                                            <Eye className="w-3 h-3" />
                                            Ver
                                        </button>
                                        <button
                                            onClick={() => setFiltroNivel('EXPORTAR')}
                                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 ${filtroNivel === 'EXPORTAR'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'text-slate-500 hover:text-slate-300'
                                                }`}
                                        >
                                            <Download className="w-3 h-3" />
                                            Exp
                                        </button>
                                    </div>

                                    {/* Ordenação */}
                                    <button
                                        onClick={() => setOrdenacao(prev => prev === 'nome' ? 'nivel' : 'nome')}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-300 bg-slate-800/30 rounded-lg border border-white/5 transition-colors"
                                    >
                                        <ArrowUpDown className="w-3 h-3" />
                                        {ordenacao === 'nome' ? 'Nome' : 'Nível'}
                                    </button>

                                    {/* Contador */}
                                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1.5 rounded-lg border border-purple-500/20">
                                        {permissoesFiltradas.length}/{permissoes.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Lista de Usuários com Permissão */}
                        <div className="flex-1 overflow-y-auto premium-scrollbar p-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <Loader2 className="w-7 h-7 text-purple-500 animate-spin" />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Carregando permissões...</p>
                                </div>
                            ) : permissoesFiltradas.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center">
                                        {buscaPermissao || filtroNivel !== 'TODOS' ? (
                                            <AlertCircle className="w-8 h-8 text-slate-700" />
                                        ) : (
                                            <ShieldCheck className="w-8 h-8 text-slate-700" />
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-slate-400 text-sm font-semibold mb-1">
                                            {buscaPermissao || filtroNivel !== 'TODOS'
                                                ? 'Nenhum resultado encontrado'
                                                : 'Nenhum usuário comum tem acesso'}
                                        </p>
                                        <p className="text-slate-500 text-xs">
                                            {buscaPermissao || filtroNivel !== 'TODOS'
                                                ? 'Tente ajustar os filtros'
                                                : 'Apenas Administradores e Técnicos podem visualizar este relatório'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-2 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
                                    {permissoesFiltradas.map((p, index) => (
                                        <PermissaoItem
                                            key={p.id}
                                            permissao={p}
                                            onRemover={handleRemover}
                                            salvando={salvando}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Minimalista */}
                <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex justify-end shrink-0">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white font-semibold text-xs px-5 hover:bg-white/5"
                    >
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
