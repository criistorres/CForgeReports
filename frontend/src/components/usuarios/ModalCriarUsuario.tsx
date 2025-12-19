import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '@/services/usuarioService';
import type { CreateUsuarioData, UserRole } from '@/types/usuario';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';

const ROLE_OPTIONS = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'TECNICO', label: 'Técnico' },
    { value: 'USUARIO', label: 'Usuário' }
];

export function ModalCriarUsuario() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateUsuarioData>({
        nome: '',
        email: '',
        role: 'USUARIO'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            await usuarioService.create(formData);
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
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-white">Novo Usuário</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nome" className="text-slate-300">Nome</Label>
                        <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            className="bg-slate-800/50 border-slate-700 text-white focus:border-purple-500"
                            placeholder="Nome Completo"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-slate-800/50 border-slate-700 text-white focus:border-purple-500"
                            placeholder="email@exemplo.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-slate-300">Perfil</Label>
                        <select
                            id="role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-purple-500 appearance-none"
                        >
                            {ROLE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value} className="bg-slate-900">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate('/usuarios')}
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            ) : null}
                            {loading ? 'Criando...' : 'Criar Usuário'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
