import { useState, useEffect } from 'react';
import { usuarioService } from '@/services/usuarioService';
import type { Cargo, Departamento } from '@/types/usuario';
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
import { Briefcase, Building2, Plus, Trash2, Loader2, X } from 'lucide-react';

interface ModalGestaoCategoriasProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate?: () => void;
}

export function ModalGestaoCategorias({ open, onOpenChange, onUpdate }: ModalGestaoCategoriasProps) {
    const { showToast } = useToast();
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [loading, setLoading] = useState(false);
    const [newItem, setNewItem] = useState('');
    const [activeTab, setActiveTab] = useState<'cargo' | 'depto'>('cargo');

    useEffect(() => {
        if (open) {
            loadData();
        }
    }, [open]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [c, d] = await Promise.all([
                usuarioService.listCargos(),
                usuarioService.listDepartamentos()
            ]);
            setCargos(c);
            setDepartamentos(d);
        } catch (error) {
            showToast('Erro ao carregar dados', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newItem.trim()) return;
        try {
            if (activeTab === 'cargo') {
                await usuarioService.createCargo(newItem);
            } else {
                await usuarioService.createDepartamento(newItem);
            }
            showToast('Cadastrado com sucesso!', 'success');
            setNewItem('');
            loadData();
            onUpdate?.();
        } catch (error) {
            showToast('Erro ao cadastrar. Talvez já exista?', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            if (activeTab === 'cargo') {
                await usuarioService.deleteCargo(id);
            } else {
                await usuarioService.deleteDepartamento(id);
            }
            showToast('Removido com sucesso', 'success');
            loadData();
            onUpdate?.();
        } catch (error) {
            showToast('Erro ao remover. Verifique se há usuários vinculados.', 'error');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] bg-slate-900 border-white/10 text-white rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                <DialogHeader>
                    <div className="flex justify-between items-center mb-6">
                        <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                            GESTÃO DE CATEGORIAS
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="text-slate-500 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-950/50 rounded-xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('cargo')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'cargo' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Briefcase className="w-3.5 h-3.5" />
                            Cargos
                        </button>
                        <button
                            onClick={() => setActiveTab('depto')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'depto' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Building2 className="w-3.5 h-3.5" />
                            Deptos
                        </button>
                    </div>

                    {/* Add Form */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Novo {activeTab === 'cargo' ? 'Cargo' : 'Departamento'}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Ex: Gerente, Vendas..."
                                className="bg-slate-950/40 border-white/5 h-11 px-4 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                            />
                            <Button
                                onClick={handleAdd}
                                className="bg-purple-600 hover:bg-purple-500 text-white w-11 h-11 p-0 rounded-xl shadow-lg border-0"
                            >
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-2xl max-h-[250px] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 flex justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {(activeTab === 'cargo' ? cargos : departamentos).map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-3 hover:bg-white/5 transition-colors">
                                        <span className="text-sm font-medium text-slate-300">{item.nome}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(item.id)}
                                            className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8 p-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {(activeTab === 'cargo' ? cargos : departamentos).length === 0 && (
                                    <div className="p-8 text-center text-slate-500 text-xs italic">
                                        Nenhum registro encontrado
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
