import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '@/services/usuarioService';
import type { Usuario, UserStatus } from '@/types/usuario';
import { Button } from '@/components/ui/button';
import {
    Plus,
    User,
    Search,
    Users,
    UserCheck,
    UserPlus,
    Shield,
    Filter,
    Mail,
    Calendar,
    ChevronRight,
    Briefcase,
    Building2,
    Settings2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable } from '@/components/features/DataTable';
import { ModalGestaoCategorias } from '@/components/usuarios/ModalGestaoCategorias';
import { useToast } from '@/hooks/useToast';
import type { ColumnDef } from '@tanstack/react-table';

const STATUS_LABELS: Record<UserStatus, { label: string; variant: string; color: string }> = {
    ativo: { label: 'Ativo', variant: 'success', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    pendente: { label: 'Pendente', variant: 'warning', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    inativo: { label: 'Inativo', variant: 'secondary', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' }
};

const ROLE_LABELS = {
    ADMIN: 'Administrador',
    TECNICO: 'Técnico',
    USUARIO: 'Usuário'
};

const AVATAR_COLORS = [
    'bg-purple-500/20 text-purple-400',
    'bg-blue-500/20 text-blue-400',
    'bg-emerald-500/20 text-emerald-400',
    'bg-amber-500/20 text-amber-400',
    'bg-pink-500/20 text-pink-400',
    'bg-indigo-500/20 text-indigo-400',
];

const getAvatarColor = (name: string) => {
    const index = name.length % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};

export function ListaUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [statusFilter, setStatusFilter] = useState<'todos' | UserStatus>('todos');
    const [showCategories, setShowCategories] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = async () => {
        try {
            setLoading(true);
            const data = await usuarioService.list();
            setUsuarios(data);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            showToast('Erro ao carregar usuários', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReenviarConvite = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await usuarioService.reenviarConvite(id);
            showToast('Convite reenviado com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao reenviar convite', 'error');
        }
    };

    const stats = useMemo(() => {
        return {
            total: usuarios.length,
            ativos: usuarios.filter(u => u.status === 'ativo').length,
            admins: usuarios.filter(u => u.role === 'ADMIN').length
        };
    }, [usuarios]);

    const filteredUsuarios = usuarios.filter(usuario => {
        const matchesBusca = usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
            usuario.email.toLowerCase().includes(busca.toLowerCase());
        const matchesStatus = statusFilter === 'todos' || usuario.status === statusFilter;
        return matchesBusca && matchesStatus;
    });

    const columns: ColumnDef<Usuario>[] = [
        {
            accessorKey: 'nome',
            header: 'Usuário',
            cell: (info) => (
                <div className="flex items-center gap-3 py-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ring-1 ring-white/5 shadow-inner ${getAvatarColor(info.row.original.nome)}`}>
                        {info.row.original.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{info.getValue() as string}</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {info.row.original.email}
                        </span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'role',
            header: 'Nível de Acesso',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    {info.getValue() === 'ADMIN' ? (
                        <Shield className="w-3.5 h-3.5 text-purple-400" />
                    ) : (
                        <User className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${info.getValue() === 'ADMIN'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : info.getValue() === 'TECNICO'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                        {ROLE_LABELS[info.getValue() as keyof typeof ROLE_LABELS]}
                    </span>
                </div>
            )
        },
        {
            id: 'info_corporativa',
            header: 'Cargo / Departamento',
            cell: (info) => (
                <div className="flex flex-col gap-1">
                    {info.row.original.cargo_nome ? (
                        <span className="text-xs text-slate-300 flex items-center gap-1.5">
                            <Briefcase className="w-3 h-3 text-slate-500" />
                            {info.row.original.cargo_nome}
                        </span>
                    ) : (
                        <span className="text-[10px] italic text-slate-600">Cargo não definido</span>
                    )}
                    {info.row.original.departamento_nome && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            {info.row.original.departamento_nome}
                        </span>
                    )}
                </div>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info) => {
                const status = info.getValue() as UserStatus;
                const config = STATUS_LABELS[status];
                return (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${config.color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${config.color.split(' ')[0].replace('text-', 'bg-')}`} />
                        {config.label}
                    </div>
                );
            }
        },
        {
            accessorKey: 'criado_em',
            header: 'Cadastro',
            cell: (info) => (
                <div className="flex flex-col">
                    <span className="text-slate-300 text-sm flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(info.getValue() as string).toLocaleDateString('pt-BR')}
                    </span>
                </div>
            )
        },
        {
            id: 'actions',
            header: '',
            cell: (info) => (
                <div className="flex items-center justify-end gap-2">
                    {info.row.original.status === 'pendente' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleReenviarConvite(info.row.original.id, e)}
                            className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 h-8 text-[11px] font-bold uppercase"
                        >
                            Reenviar
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/usuarios/${info.row.original.id}`)}
                        className="text-slate-400 hover:text-white hover:bg-slate-700 h-8 w-8 p-0 rounded-lg group"
                    >
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <AppLayout>
                <div className="p-8">
                    <div className="flex items-center justify-center h-[60vh]">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
                                <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <p className="text-slate-400 font-medium animate-pulse">Sincronizando usuários...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-purple-500/10 rounded-xl">
                                <Users className="w-6 h-6 text-purple-400" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                Gestão de Usuários
                            </h1>
                        </div>
                        <p className="text-slate-400">Controle permissões e visualize o estado da sua equipe</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setShowCategories(true)}
                            className="text-slate-400 hover:text-white hover:bg-slate-800 h-11 px-4 rounded-xl border border-white/5 transition-all"
                            title="Gerenciar Cargos e Departamentos"
                        >
                            <Settings2 className="w-5 h-5 mr-2" />
                            CATEGORIAS
                        </Button>
                        <Button
                            onClick={() => navigate('/usuarios/novo')}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95 border-0"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            NOVO USUÁRIO
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute right-[-10%] top-[-10%] rotate-12 opacity-[0.03] transition-transform group-hover:scale-110">
                            <Users size={120} />
                        </div>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total de Membros</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{stats.total}</span>
                            <span className="text-[11px] text-slate-500 font-medium">Cadastrados</span>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute right-[-10%] top-[-10%] rotate-12 opacity-[0.03] transition-transform group-hover:scale-110">
                            <UserCheck size={120} />
                        </div>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Membros Ativos</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-emerald-400">{stats.ativos}</span>
                            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">{(stats.total > 0 ? (stats.ativos / stats.total) * 100 : 0).toFixed(0)}% da base</span>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute right-[-10%] top-[-10%] rotate-12 opacity-[0.03] transition-transform group-hover:scale-110">
                            <Shield size={120} />
                        </div>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Administradores</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-purple-400">{stats.admins}</span>
                            <span className="text-[11px] text-slate-500 font-medium">Gestores</span>
                        </div>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="bg-slate-900/40 border border-white/5 p-1 rounded-2xl">
                    <div className="flex flex-col lg:flex-row gap-4 p-4 lg:items-center">
                        {/* Status Tabs */}
                        <div className="flex p-1 bg-slate-950/50 rounded-xl border border-white/5 self-start lg:self-auto">
                            {[
                                { id: 'todos', label: 'Todos', icon: Filter },
                                { id: 'ativo', label: 'Ativos', icon: UserCheck },
                                { id: 'inativo', label: 'Inativos', icon: UserPlus }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setStatusFilter(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${statusFilter === tab.id
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Filtrar por nome ou email..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-950/30 text-white text-sm rounded-xl border border-white/5 focus:border-purple-500 focus:outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="p-1">
                        {filteredUsuarios.length === 0 ? (
                            <div className="py-20 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                                    <Search className="w-8 h-8 text-slate-600" />
                                </div>
                                <h3 className="text-white font-bold text-lg">Nenhum usuário encontrado</h3>
                                <p className="text-slate-500 text-sm max-w-[250px] mt-1">
                                    Não encontramos registros para o filtro ou busca selecionada.
                                </p>
                            </div>
                        ) : (
                            <DataTable data={filteredUsuarios} columns={columns} />
                        )}
                    </div>
                </div>
            </div>
            <ModalGestaoCategorias
                open={showCategories}
                onOpenChange={setShowCategories}
                onUpdate={loadUsuarios}
            />
        </AppLayout>
    );
}
