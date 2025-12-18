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
import { Select } from '@/components/ui/select';

const ROLE_OPTIONS = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'TECNICO', label: 'Técnico' },
    { value: 'USUARIO', label: 'Usuário' }
];

export function ModalCriarUsuario() {
    const navigate = useNavigate();
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
            alert('Usuário criado! Email de convite enviado.');
            navigate('/usuarios');
        } catch (error: any) {
            const message = error.response?.data?.email?.[0] || 'Erro ao criar usuário';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open onOpenChange={() => navigate('/usuarios')}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Usuário</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="nome">Nome</Label>
                        <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="role">Perfil</Label>
                        <Select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                        >
                            {ROLE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/usuarios')}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Usuário'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
