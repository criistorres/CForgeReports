import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '@/services/usuarioService';
import type { CreateUsuarioData, UserRole, Cargo, Departamento } from '@/types/usuario';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { ValidatedInput } from '@/components/ui/validated-input';
import { Phone, Briefcase, Building2, User, Mail, Shield, Plus, Loader2 } from 'lucide-react';

const ROLE_OPTIONS = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'TECNICO', label: 'Técnico' },
    { value: 'USUARIO', label: 'Usuário' }
];

export function ModalCriarUsuario() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [formData, setFormData] = useState<CreateUsuarioData>({
        nome: '',
        email: '',
        role: 'USUARIO',
        telefone: '',
        cargo: '',
        departamento: ''
    });

    useEffect(() => {
        loadMetadados();
    }, []);

    const loadMetadados = async () => {
        try {
            const [c, d] = await Promise.all([
                usuarioService.listCargos(),
                usuarioService.listDepartamentos()
            ]);
            setCargos(c);
            setDepartamentos(d);
        } catch (error) {
            console.error('Erro ao carregar metadados:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            // Remove campos vazios para não enviar string vazia para as FKs
            const payload = { ...formData };
            if (!payload.cargo) delete payload.cargo;
            if (!payload.departamento) delete payload.departamento;

            await usuarioService.create(payload);
            showToast('Usuário criado! Email de convite enviado.', 'success');
            navigate('/usuarios');
        } catch (error: any) {
            const message = error.response?.data?.email?.[0] || 'Erro ao criar usuário';
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open onOpenChange={() => navigate('/usuarios')}>
            <DialogContent className="sm:max-w-[550px] bg-slate-900 border-white/10 text-white rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black text-white flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                            <Plus className="w-6 h-6 text-purple-400" />
                        </div>
                        NOVO USUÁRIO
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ValidatedInput
                            label="Nome Completo"
                            icon={<User className="w-4 h-4" />}
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            className="bg-slate-950/40 border-white/5"
                            placeholder="Ex: João Silva"
                            required
                        />

                        <ValidatedInput
                            label="Email Corporativo"
                            type="email"
                            icon={<Mail className="w-4 h-4" />}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-slate-950/40 border-white/5"
                            placeholder="joao@empresa.com"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                                Perfil de Acesso
                            </Label>
                            <div className="relative group">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                    className="w-full h-11 bg-slate-950/40 text-white pl-11 pr-4 rounded-xl border border-white/5 focus:border-purple-500 focus:outline-none transition-all appearance-none"
                                >
                                    {ROLE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value} className="bg-slate-900">
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <ValidatedInput
                            label="Telefone / WhatsApp"
                            icon={<Phone className="w-4 h-4" />}
                            value={formData.telefone}
                            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                            className="bg-slate-950/40 border-white/5"
                            placeholder="(00) 00000-0000"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                                Departamento
                            </Label>
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                                <select
                                    value={formData.departamento}
                                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                                    className="w-full h-11 bg-slate-950/40 text-white pl-11 pr-4 rounded-xl border border-white/5 focus:border-purple-500 focus:outline-none transition-all appearance-none"
                                >
                                    <option value="" className="bg-slate-900">Selecionar...</option>
                                    {departamentos.map((d) => (
                                        <option key={d.id} value={d.id} className="bg-slate-900">
                                            {d.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                                Cargo
                            </Label>
                            <div className="relative group">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                                <select
                                    value={formData.cargo}
                                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                                    className="w-full h-11 bg-slate-950/40 text-white pl-11 pr-4 rounded-xl border border-white/5 focus:border-purple-500 focus:outline-none transition-all appearance-none"
                                >
                                    <option value="" className="bg-slate-900">Selecionar...</option>
                                    {cargos.map((c) => (
                                        <option key={c.id} value={c.id} className="bg-slate-900">
                                            {c.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate('/usuarios')}
                            className="text-slate-500 hover:text-white h-11 px-6 font-bold uppercase tracking-widest text-[10px]"
                        >
                            CANCELAR
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-black h-11 px-8 rounded-xl shadow-lg shadow-purple-500/20 active:scale-95 transition-all border-0"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            CRIAR USUÁRIO
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
