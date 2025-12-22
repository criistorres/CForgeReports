import { useState, useEffect } from 'react'
import {
    X,
    Calendar,
    Clock,
    Mail,
    Repeat,
    CheckCircle2,
    Loader2,
    Plus,
} from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import api from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'

interface AgendamentoModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    agendamentoId?: string | null // Se informado, é edição
}

interface Relatorio {
    id: number
    nome: string
}

interface AgendamentoFormData {
    nome: string
    relatorio: number | string
    frequencia: 'DIARIO' | 'SEMANAL' | 'MENSAL'
    hora_execucao: string
    dias_semana: number[]
    dia_mes: number | ''
    emails_destino: string[]
    enviar_email: boolean
    ativo: boolean
}

const DIAS_SEMANA = [
    { id: 0, label: 'Dom' },
    { id: 1, label: 'Seg' },
    { id: 2, label: 'Ter' },
    { id: 3, label: 'Qua' },
    { id: 4, label: 'Qui' },
    { id: 5, label: 'Sex' },
    { id: 6, label: 'Sáb' },
]

export function AgendamentoModal({ isOpen, onClose, onSuccess, agendamentoId }: AgendamentoModalProps) {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [relatorios, setRelatorios] = useState<Relatorio[]>([])

    const [formData, setFormData] = useState<AgendamentoFormData>({
        nome: '',
        relatorio: '',
        frequencia: 'DIARIO',
        hora_execucao: '08:00',
        dias_semana: [],
        dia_mes: '',
        emails_destino: [],
        enviar_email: true,
        ativo: true
    })

    const [newEmail, setNewEmail] = useState('')

    useEffect(() => {
        if (isOpen) {
            loadRelatorios()
            if (agendamentoId) {
                loadAgendamento(agendamentoId)
            } else {
                resetForm()
            }
        }
    }, [isOpen, agendamentoId])

    const loadRelatorios = async () => {
        try {
            const response = await api.get('/relatorios/')
            console.log('Relatórios carregados:', response.data)
            setRelatorios(response.data.results || response.data) // Suporte para paginação se houver
        } catch (error) {
            console.error(error)
            showToast('Erro ao carregar relatórios', 'error')
        }
    }

    const loadAgendamento = async (id: string) => {
        try {
            setLoading(true)
            const response = await api.get(`/agendamentos/${id}/`)
            const data = response.data
            setFormData({
                nome: data.nome,
                relatorio: data.relatorio,
                frequencia: data.frequencia,
                hora_execucao: data.hora_execucao.substring(0, 5), // Remove segundos se houver
                dias_semana: data.dias_semana || [],
                dia_mes: data.dia_mes || '',
                emails_destino: data.emails_destino || [],
                enviar_email: data.enviar_email,
                ativo: data.ativo
            })
        } catch (error) {
            console.error(error)
            showToast('Erro ao carregar agendamento', 'error')
            onClose()
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            nome: '',
            relatorio: '',
            frequencia: 'DIARIO',
            hora_execucao: '08:00',
            dias_semana: [],
            dia_mes: '',
            emails_destino: [],
            enviar_email: true,
            ativo: true
        })
        setNewEmail('')
    }

    const handleAddEmail = () => {
        if (!newEmail || !newEmail.includes('@')) return
        if (formData.emails_destino.includes(newEmail)) {
            setNewEmail('')
            return
        }
        setFormData(prev => ({
            ...prev,
            emails_destino: [...prev.emails_destino, newEmail],
        }))
        setNewEmail('')
    }

    const removeEmail = (email: string) => {
        setFormData(prev => ({
            ...prev,
            emails_destino: prev.emails_destino.filter(e => e !== email),
        }))
    }

    const toggleDiaSemana = (dia: number) => {
        setFormData(prev => {
            const current = prev.dias_semana
            if (current.includes(dia)) {
                return { ...prev, dias_semana: current.filter(d => d !== dia) }
            } else {
                return { ...prev, dias_semana: [...current, dia].sort() }
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validações
        if (!formData.nome || !formData.relatorio || !formData.hora_execucao) {
            showToast('Preencha os campos obrigatórios', 'error')
            return
        }

        if (formData.frequencia === 'SEMANAL' && formData.dias_semana.length === 0) {
            showToast('Selecione pelo menos um dia da semana', 'error')
            return
        }

        if (formData.frequencia === 'MENSAL' && !formData.dia_mes) {
            showToast('Informe o dia do mês', 'error')
            return
        }

        if (formData.enviar_email && formData.emails_destino.length === 0) {
            showToast('Adicione pelo menos um email de destino', 'error')
            return
        }

        try {
            setSaving(true)
            const payload = {
                ...formData,
                dia_mes: formData.dia_mes === '' ? null : Number(formData.dia_mes)
            }

            if (agendamentoId) {
                await api.put(`/agendamentos/${agendamentoId}/`, payload)
                showToast('Agendamento atualizado com sucesso!', 'success')
            } else {
                await api.post('/agendamentos/', payload)
                showToast('Agendamento criado com sucesso!', 'success')
            }
            onSuccess()
        } catch (error: any) {
            console.error(error)
            const msg = error.response?.data?.detail || 'Erro ao salvar agendamento'
            showToast(msg, 'error')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-200">
                    <Dialog.Description className="sr-only">
                        Formulário para criar ou editar agendamentos de execução automática de relatórios.
                    </Dialog.Description>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Calendar className="w-5 h-5 text-purple-400" />
                            </div>
                            <Dialog.Title className="text-lg font-semibold text-white">
                                {agendamentoId ? 'Editar Agendamento' : 'Novo Agendamento'}
                            </Dialog.Title>
                        </div>
                        <Dialog.Close asChild>
                            <button className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto premium-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                            </div>
                        ) : (
                            <>
                                {/* Nome e Relatório */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">
                                            Nome do Agendamento <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.nome}
                                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                                            placeholder="Ex: Relatório Diário de Vendas"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">
                                            Relatório <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            value={formData.relatorio}
                                            onChange={e => setFormData({ ...formData, relatorio: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all appearance-none"
                                            required
                                        >
                                            <option value="" className="text-gray-900">Selecione um relatório...</option>
                                            {relatorios.map(rel => (
                                                <option key={rel.id} value={rel.id} className="text-gray-900">
                                                    {rel.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Frequência e Hora */}
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                                <Repeat className="w-4 h-4 text-purple-400" />
                                                Frequência
                                            </label>
                                            <select
                                                value={formData.frequencia}
                                                onChange={e => setFormData({ ...formData, frequencia: e.target.value as any })}
                                                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                                            >
                                                <option value="DIARIO">Diário (Todos os dias)</option>
                                                <option value="SEMANAL">Semanal (Dias específicos)</option>
                                                <option value="MENSAL">Mensal (Dia fixo)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-purple-400" />
                                                Horário de Execução
                                            </label>
                                            <input
                                                type="time"
                                                value={formData.hora_execucao}
                                                onChange={e => setFormData({ ...formData, hora_execucao: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Configuração Específica de Frequência */}
                                    {formData.frequencia === 'SEMANAL' && (
                                        <div className="space-y-2 animate-in slide-in-from-top-2">
                                            <label className="text-sm font-medium text-slate-300">Dias da Semana</label>
                                            <div className="flex flex-wrap gap-2">
                                                {DIAS_SEMANA.map(dia => (
                                                    <button
                                                        key={dia.id}
                                                        type="button"
                                                        onClick={() => toggleDiaSemana(dia.id)}
                                                        className={`
                                                            px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                                            ${formData.dias_semana.includes(dia.id)
                                                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                                                            }
                                                        `}
                                                    >
                                                        {dia.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {formData.frequencia === 'MENSAL' && (
                                        <div className="space-y-2 animate-in slide-in-from-top-2">
                                            <label className="text-sm font-medium text-slate-300">Dia do Mês (1-31)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="31"
                                                value={formData.dia_mes}
                                                onChange={e => setFormData({ ...formData, dia_mes: e.target.value as any })}
                                                className="w-full max-w-[100px] px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                                                placeholder="Ex: 5"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Destinatários de Email */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-purple-400" />
                                            Destinatários do Relatório
                                        </label>
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <input
                                                type="checkbox"
                                                id="enviarEmail"
                                                checked={formData.enviar_email}
                                                onChange={e => setFormData({ ...formData, enviar_email: e.target.checked })}
                                                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                                            />
                                            <label htmlFor="enviarEmail">Habilitar envio</label>
                                        </div>
                                    </div>

                                    {formData.enviar_email && (
                                        <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 space-y-3">
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    value={newEmail}
                                                    onChange={e => setNewEmail(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
                                                    placeholder="Digite um email e pressione Enter"
                                                    className="flex-1 px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all text-sm"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={handleAddEmail}
                                                    variant="secondary"
                                                    className="px-3 rounded-xl hover:bg-slate-700"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {formData.emails_destino.map(email => (
                                                    <div key={email} className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-200">
                                                        <span>{email}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeEmail(email)}
                                                            className="text-purple-400 hover:text-white transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {formData.emails_destino.length === 0 && (
                                                    <span className="text-sm text-slate-500 italic">Nenhum email adicionado</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={saving}
                                className="border-white/10 hover:bg-white/5 text-slate-300"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving || loading}
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/20"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        {agendamentoId ? 'Salvar Alterações' : 'Criar Agendamento'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
