import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '@/services/usuarioService';
import type { Usuario, UserStatus } from '@/types/usuario';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, User, Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable } from '@/components/features/DataTable';
import { useToast } from '@/hooks/useToast';
import type { ColumnDef } from '@tanstack/react-table';

const STATUS_LABELS: Record<UserStatus, { label: string; variant: string }> = {
    ativo: { label: 'Ativo', variant: 'success' },
    pendente: { label: 'Pendente', variant: 'warning' },
    inativo: { label: 'Inativo', variant: 'secondary' }
};

const ROLE_LABELS = {
    ADMIN: 'Administrador',
    TECNICO: 'Técnico',
    USUARIO: 'Usuário'
};

export function ListaUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
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
        } finally {
            setLoading(false);
        }
    };

    const handleReenviarConvite = async (id: string) => {
        try {
            await usuarioService.reenviarConvite(id);
            showToast('Convite reenviado com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao reenviar convite', 'error');
        }
    };

    const filteredUsuarios = usuarios.filter(usuario =>
        usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
        usuario.email.toLowerCase().includes(busca.toLowerCase())
    );

    const columns: ColumnDef<Usuario>[] = [
        {
            accessorKey: 'nome',
            header: 'Nome',
            cell: (info) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-purple-400 font-bold text-xs">
                        {info.row.original.nome.substring(0, 2).toUpperCase()}
                    </div>
                    {info.getValue() as string}
                </div>
            )
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: (info) => <span className="text-slate-400">{info.getValue() as string}</span>
        },
        {
            accessorKey: 'role',
            header: 'Perfil',
            cell: (info) => (
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${info.getValue() === 'ADMIN'
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    : info.getValue() === 'TECNICO'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }`}>
                    {ROLE_LABELS[info.getValue() as keyof typeof ROLE_LABELS]}
                </span>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info) => {
                const status = info.getValue() as UserStatus;
                return (
                    <Badge variant={STATUS_LABELS[status].variant as any} className="capitalize">
                        {STATUS_LABELS[status].label}
                    </Badge>
                );
            }
        },
        {
            accessorKey: 'criado_em',
            header: 'Criado Em',
            cell: (info) => (
                <span className="text-slate-400 text-sm">
                    {new Date(info.getValue() as string).toLocaleDateString('pt-BR')}
                </span>
            )
        },
        {
            id: 'actions',
            header: 'Ações',
            cell: (info) => (
                <div className="flex items-center justify-end gap-2">
                    {info.row.original.status === 'pendente' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReenviarConvite(info.row.original.id)}
                            className="text-slate-400 hover:text-white hover:bg-slate-700 h-8 text-xs"
                        >
                            Reenviar Convite
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/usuarios/${info.row.original.id}`)}
                        className="text-slate-400 hover:text-white hover:bg-slate-700 h-8 w-8 p-0"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <AppLayout>
                <div className="p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-400">Carregando usuários...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <User className="w-6 h-6 text-purple-400" />
                            Usuários
                        </h1>
                        <p className="text-slate-400 mt-1">Gerencie os usuários da sua empresa</p>
                    </div>
                    <Button
                        onClick={() => navigate('/usuarios/novo')}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors border-0"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Usuário
                    </Button>
                </div>

                {/* Busca */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar usuários por nome ou email..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 text-white rounded-lg border border-slate-700/50 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                </div>

                {filteredUsuarios.length === 0 ? (
                    <div className="bg-slate-800/50 border border-slate-700/50 p-12 rounded-xl text-center">
                        <User className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 mb-4">
                            {busca ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                        </p>
                        {!busca && (
                            <Button
                                onClick={() => navigate('/usuarios/novo')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors border-0"
                            >
                                <Plus className="w-4 h-4" />
                                Criar Primeiro Usuário
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden shadow-sm p-1">
                        <DataTable data={filteredUsuarios} columns={columns} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
