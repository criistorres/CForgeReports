import { useState } from 'react'
import { Key, Loader2, ShieldCheck } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import api from '@/services/api'

interface ModalAlterarSenhaProps {
    isOpen: boolean
    onClose: () => void
}

export function ModalAlterarSenha({ isOpen, onClose }: ModalAlterarSenhaProps) {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        senha_atual: '',
        nova_senha: '',
        confirmar_senha: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.nova_senha.length < 6) {
            showToast('A nova senha deve ter pelo menos 6 caracteres', 'error')
            return
        }

        if (formData.nova_senha !== formData.confirmar_senha) {
            showToast('As senhas não coincidem', 'error')
            return
        }

        try {
            setLoading(true)
            await api.post('/usuarios/alterar_senha/', {
                senha_atual: formData.senha_atual,
                nova_senha: formData.nova_senha
            })

            showToast('Senha alterada com sucesso!', 'success')
            handleClose()
        } catch (error: any) {
            const mensagem = error.response?.data?.detail || 'Erro ao alterar senha'
            showToast(mensagem, 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFormData({
            senha_atual: '',
            nova_senha: '',
            confirmar_senha: ''
        })
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Key className="w-6 h-6 text-purple-400" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-white">
                        Alterar Senha
                    </DialogTitle>
                    <p className="text-slate-400 text-sm mt-1">
                        Para sua segurança, não compartilhe sua senha com ninguém.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                            Senha Atual
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.senha_atual}
                            onChange={(e) => setFormData({ ...formData, senha_atual: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                            Nova Senha
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.nova_senha}
                            onChange={(e) => setFormData({ ...formData, nova_senha: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                            Confirmar Nova Senha
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.confirmar_senha}
                            onChange={(e) => setFormData({ ...formData, confirmar_senha: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                            placeholder="Repita a nova senha"
                        />
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white h-12 rounded-xl font-bold shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Atualizar Senha'
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={loading}
                            className="w-full text-slate-400 hover:text-white h-12 rounded-xl"
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>

                <div className="mt-2 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Sua senha deve conter uma combinação de letras, números e caracteres especiais para maior segurança.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
