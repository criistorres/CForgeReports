import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usuarioService } from '@/services/usuarioService';
import type { Usuario, UpdateUsuarioData, UserRole, UserStatus, Cargo, Departamento } from '@/types/usuario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Ban, CheckCircle, User, Mail, Shield, Calendar, Copy, AlertTriangle, Key, Phone, Briefcase, Building2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AppLayout } from '@/components/layout/AppLayout';
import { useToast } from '@/hooks/useToast';

const STATUS_LABELS: Record<UserStatus, { label: string; variant: string; color: string }> = {
    ativo: { label: 'Ativo', variant: 'success', color: 'text-green-500' },
    pendente: { label: 'Pendente', variant: 'warning', color: 'text-yellow-500' },
    inativo: { label: 'Inativo', variant: 'secondary', color: 'text-slate-500' }
};

export function DetalheUsuario() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDesativarDialog, setShowDesativarDialog] = useState(false);
    const [showRedefinirSenhaDialog, setShowRedefinirSenhaDialog] = useState(false);
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const { showToast } = useToast();
    const [formData, setFormData] = useState<UpdateUsuarioData>({
        nome: '',
        role: 'USUARIO',
        telefone: '',
        cargo: '',
        departamento: ''
    });

    useEffect(() => {
        loadUsuario();
    }, [id]);

    const loadUsuario = async () => {
        try {
            setLoading(true);
            const [data, c, d] = await Promise.all([
                usuarioService.get(id!),
                usuarioService.listCargos(),
                usuarioService.listDepartamentos()
            ]);
            setUsuario(data);
            setCargos(c);
            setDepartamentos(d);
            setFormData({
                nome: data.nome,
                role: data.role,
                telefone: data.telefone || '',
                cargo: data.cargo?.id || '',
                departamento: data.departamento?.id || ''
            });
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            navigate('/usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await usuarioService.update(id!, formData);
            showToast('Usuário atualizado com sucesso!', 'success');
            loadUsuario();
        } catch (error: any) {
            const message = error.response?.data?.role?.[0] || 'Erro ao atualizar usuário';
            showToast(message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDesativar = async () => {
        try {
            await usuarioService.desativar(id!);
            showToast('Usuário desativado com sucesso!', 'success');
            navigate('/usuarios');
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Erro ao desativar usuário';
            showToast(message, 'error');
        }
    };

    const handleReativar = async () => {
        try {
            await usuarioService.reativar(id!);
            showToast('Usuário reativado com sucesso!', 'success');
            loadUsuario();
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Erro ao reativar usuário';
            showToast(message, 'error');
        }
    };

    const handleRedefinirSenha = async () => {
        if (novaSenha.length < 6) {
            showToast('A senha deve ter pelo menos 6 caracteres', 'warning');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            showToast('As senhas não coincidem', 'warning');
            return;
        }

        try {
            await usuarioService.redefinirSenha(id!, novaSenha);
            showToast('Senha redefinida com sucesso!', 'success');
            setShowRedefinirSenhaDialog(false);
            setNovaSenha('');
            setConfirmarSenha('');
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Erro ao redefinir senha';
            showToast(message, 'error');
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-400">Carregando detalhes...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!usuario) return null;

    return (
        <AppLayout>
            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/usuarios')}
                        className="text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Voltar
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            {usuario.nome}
                            <Badge variant={STATUS_LABELS[usuario.status].variant as any} className="text-sm px-3 py-1">
                                {STATUS_LABELS[usuario.status].label}
                            </Badge>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">{usuario.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-400" />
                                Informações Pessoais
                            </h2>

                            <div className="space-y-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="nome" className="text-slate-300">Nome Completo</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <Input
                                            id="nome"
                                            value={formData.nome}
                                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                            className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <Input
                                            id="email"
                                            value={usuario.email}
                                            disabled
                                            className="pl-10 bg-slate-900/30 border-slate-800 text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        O email não pode ser alterado por questões de segurança
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="role" className="text-slate-300">Perfil de Acesso</Label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                            <select
                                                id="role"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-md py-2 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                                            >
                                                <option value="ADMIN">Administrador (Acesso total)</option>
                                                <option value="TECNICO">Técnico (Gerencia conexões)</option>
                                                <option value="USUARIO">Usuário (Visualiza relatórios)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="telefone" className="text-slate-300">Telefone / WhatsApp</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <Input
                                                id="telefone"
                                                value={formData.telefone}
                                                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                                className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:border-purple-500"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="departamento" className="text-slate-300">Departamento</Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                            <select
                                                id="departamento"
                                                value={formData.departamento}
                                                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-md py-2 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                                            >
                                                <option value="">Selecionar...</option>
                                                {departamentos.map(d => (
                                                    <option key={d.id} value={d.id}>{d.nome}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="cargo" className="text-slate-300">Cargo</Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                            <select
                                                id="cargo"
                                                value={formData.cargo}
                                                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-md py-2 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                                            >
                                                <option value="">Selecionar...</option>
                                                {cargos.map(c => (
                                                    <option key={c.id} value={c.id}>{c.nome}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-purple-600 hover:bg-purple-500 text-white min-w-[150px] shadow-lg shadow-purple-900/20"
                                >
                                    {saving ? (
                                        <>Salvando...</>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Danger Zone & Security */}
                        <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-6 space-y-6">
                            <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Segurança e Ações Críticas
                            </h2>

                            {/* Redefinir Senha */}
                            <div className="flex items-center justify-between pb-6 border-b border-red-900/30">
                                <div>
                                    <h3 className="text-white font-medium">Redefinir Senha</h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Define uma nova senha manualmente para este usuário
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setShowRedefinirSenhaDialog(true)}
                                    className="bg-slate-700 hover:bg-slate-600 text-white"
                                >
                                    <Key className="w-4 h-4 mr-2" />
                                    Redefinir Senha
                                </Button>
                            </div>

                            {/* Desativar/Reativar */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">
                                        {usuario.ativo ? 'Desativar Usuário' : 'Reativar Usuário'}
                                    </h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {usuario.ativo
                                            ? 'Impede o acesso do usuário ao sistema, mas mantém seus dados.'
                                            : 'Permite que o usuário acesse o sistema novamente.'
                                        }
                                    </p>
                                </div>
                                {usuario.ativo ? (
                                    <Button
                                        onClick={() => setShowDesativarDialog(true)}
                                        variant="destructive"
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        <Ban className="w-4 h-4 mr-2" />
                                        Desativar
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleReativar}
                                        className="bg-green-600 hover:bg-green-500 text-white"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Reativar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Metadata Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Detalhes do Cadastro</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-slate-700/50 p-2 rounded-lg">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Criado em</p>
                                        <p className="text-white text-sm">
                                            {new Date(usuario.criado_em).toLocaleDateString('pt-BR', {
                                                day: '2-digit', month: 'long', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {usuario.ativado_em && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-slate-700/50 p-2 rounded-lg">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Ativado em</p>
                                            <p className="text-white text-sm">
                                                {new Date(usuario.ativado_em).toLocaleDateString('pt-BR', {
                                                    day: '2-digit', month: 'long', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {usuario.cargo && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-slate-700/50 p-2 rounded-lg">
                                            <Briefcase className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Cargo</p>
                                            <p className="text-white text-sm">{usuario.cargo.nome}</p>
                                        </div>
                                    </div>
                                )}

                                {usuario.departamento && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-slate-700/50 p-2 rounded-lg">
                                            <Building2 className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Departamento</p>
                                            <p className="text-white text-sm">{usuario.departamento.nome}</p>
                                        </div>
                                    </div>
                                )}

                                {usuario.criado_por_nome && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-slate-700/50 p-2 rounded-lg">
                                            <User className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Criado por</p>
                                            <p className="text-white text-sm">{usuario.criado_por_nome}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-700/50">
                                    <p className="text-xs text-slate-500 mb-2">ID do Usuário</p>
                                    <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded text-xs text-slate-400 font-mono">
                                        <span className="truncate">{usuario.id}</span>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(usuario.id)}
                                            className="hover:text-white transition-colors"
                                            title="Copiar ID"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dialog Desativar */}
                <AlertDialog open={showDesativarDialog} onOpenChange={setShowDesativarDialog}>
                    <AlertDialogContent className="bg-slate-800 border-slate-700">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Desativar usuário?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                                O usuário <strong>{usuario.nome}</strong> não poderá mais fazer login no sistema.
                                <br />
                                Os dados e histórico serão preservados e você pode reativar a conta a qualquer momento.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDesativar} className="bg-red-600 hover:bg-red-700 text-white border-0">
                                Confirmar Desativação
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Dialog Redefinir Senha */}
                <AlertDialog open={showRedefinirSenhaDialog} onOpenChange={setShowRedefinirSenhaDialog}>
                    <AlertDialogContent className="bg-slate-800 border-slate-700">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Redefinir Senha</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                                Digite a nova senha para o usuário <strong>{usuario.nome}</strong>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="py-2 space-y-4">
                            <div>
                                <Label htmlFor="novaSenha" className="text-slate-300">Nova Senha</Label>
                                <Input
                                    id="novaSenha"
                                    type="password"
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                    className="bg-slate-900/50 border-slate-700 text-white focus:border-purple-500 mt-2"
                                    placeholder="Mínimo de 6 caracteres"
                                />
                            </div>

                            <div>
                                <Label htmlFor="confirmarSenha" className="text-slate-300">Confirmar Senha</Label>
                                <Input
                                    id="confirmarSenha"
                                    type="password"
                                    value={confirmarSenha}
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                    className="bg-slate-900/50 border-slate-700 text-white focus:border-purple-500 mt-2"
                                    placeholder="Digite a senha novamente"
                                />
                            </div>
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => {
                                    setShowRedefinirSenhaDialog(false);
                                    setNovaSenha('');
                                    setConfirmarSenha('');
                                }}
                                className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600 hover:text-white"
                            >
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleRedefinirSenha}
                                className="bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-lg shadow-purple-900/20"
                                disabled={novaSenha.length < 6 || novaSenha !== confirmarSenha}
                            >
                                Salvar Nova Senha
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
