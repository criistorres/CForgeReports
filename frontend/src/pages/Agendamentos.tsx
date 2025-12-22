import { useState, useEffect } from 'react'
import {
    CalendarClock,
    Plus,
    Search,
    MoreVertical,
    Play,
    Pause,
    Trash2,
    Clock,
    CheckCircle2,
    Edit,
    AlertCircle,
    Loader2
} from 'lucide-react'
import api from '@/services/api'
import { AppLayout } from '@/components/layout/AppLayout'

import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { AgendamentoModal } from '@/components/features/AgendamentoModal'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface Agendamento {
    id: string
    nome: string
    frequencia: 'DIARIO' | 'SEMANAL' | 'MENSAL'
    hora_execucao: string
    ativo: boolean
    proxima_execucao: string | null
    ultima_execucao: string | null
    nome_relatorio: string
    ultima_execucao_detalhe?: {
        sucesso: boolean
        iniciado_em: string
    }
}

export default function Agendamentos() {
    const { showToast } = useToast()

    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    useEffect(() => {
        loadAgendamentos()
    }, [])

    const loadAgendamentos = async () => {
        try {
            setLoading(true)
            const response = await api.get('/agendamentos/')
            setAgendamentos(response.data)
        } catch (error) {
            console.error(error)
            showToast('Erro ao carregar agendamentos.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setSelectedId(null)
        setIsModalOpen(true)
    }

    const handleEdit = (id: string) => {
        setSelectedId(id)
        setIsModalOpen(true)
    }

    const handleSuccess = () => {
        setIsModalOpen(false)
        loadAgendamentos()
    }

    const handleToggleStatus = async (agendamento: Agendamento) => {
        try {
            const action = agendamento.ativo ? 'pausar' : 'retomar'
            await api.post(`/agendamentos/${agendamento.id}/${action}/`)
            showToast(`Agendamento ${agendamento.ativo ? 'pausado' : 'retomado'} com sucesso.`, 'success')
            loadAgendamentos()
        } catch (error) {
            console.error(error)
            showToast('Erro ao alterar status.', 'error')
        }
    }

    const handleExecuteNow = async (id: string) => {
        try {
            await api.post(`/agendamentos/${id}/executar_agora/`)
            showToast('Execução iniciada! O relatório será enviado em breve.', 'success')
        } catch (error) {
            console.error(error)
            showToast('Erro ao solicitar execução.', 'error')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este agendamento?')) return

        try {
            await api.delete(`/agendamentos/${id}/`)
            showToast('Agendamento excluído com sucesso.', 'success')
            loadAgendamentos()
        } catch (error) {
            console.error(error)
            showToast('Erro ao excluir agendamento.', 'error')
        }
    }

    const filteredAgendamentos = agendamentos.filter(a =>
        a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.nome_relatorio.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/10">
                            <CalendarClock className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Agendamentos</h1>
                            <p className="text-slate-400">Automatize o envio de relatórios por email</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar agendamentos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-sm focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none w-64 transition-all"
                            />
                        </div>
                        <Button
                            onClick={handleCreate}
                            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 border-none"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Agendamento
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                    </div>
                ) : filteredAgendamentos.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-white/5 border-dashed">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarClock className="w-8 h-8 text-slate-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Nenhum agendamento encontrado</h3>
                        <p className="text-slate-400 max-w-sm mx-auto mb-6">
                            Você ainda não tem agendamentos configurados. Crie um para receber relatórios automaticamente.
                        </p>
                        <Button onClick={handleCreate} variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                            Criar meu primeiro agendamento
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAgendamentos.map((agendamento) => (
                            <div
                                key={agendamento.id}
                                className={`
                                    group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                                    ${agendamento.ativo
                                        ? 'bg-slate-800/40 border-white/5 hover:border-purple-500/30 hover:shadow-purple-500/10'
                                        : 'bg-slate-800/20 border-white/5 opacity-75 grayscale-[0.5]'
                                    }
                                `}
                            >
                                {/* Active Indicator Bar */}
                                {agendamento.ativo && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}

                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                                                {agendamento.nome}
                                            </h3>
                                            <p className="text-sm text-slate-400 line-clamp-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {agendamento.frequencia} às {agendamento.hora_execucao.substring(0, 5)}
                                            </p>
                                        </div>

                                        <DropdownMenu.Root>
                                            <DropdownMenu.Trigger asChild>
                                                <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </DropdownMenu.Trigger>
                                            <DropdownMenu.Portal>
                                                <DropdownMenu.Content className="min-w-[160px] bg-slate-900 border border-white/10 rounded-xl p-1 shadow-xl z-50 animate-in zoom-in-95 duration-200">
                                                    <DropdownMenu.Item onClick={() => handleExecuteNow(agendamento.id)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-purple-500/20 hover:text-purple-300 rounded-lg cursor-pointer outline-none">
                                                        <Play className="w-4 h-4" /> Executar Agora
                                                    </DropdownMenu.Item>
                                                    <DropdownMenu.Item onClick={() => handleEdit(agendamento.id)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white rounded-lg cursor-pointer outline-none">
                                                        <Edit className="w-4 h-4" /> Editar
                                                    </DropdownMenu.Item>
                                                    <DropdownMenu.Item onClick={() => handleToggleStatus(agendamento)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white rounded-lg cursor-pointer outline-none">
                                                        {agendamento.ativo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                        {agendamento.ativo ? 'Pausar' : 'Retomar'}
                                                    </DropdownMenu.Item>
                                                    <DropdownMenu.Separator className="h-px bg-white/5 my-1" />
                                                    <DropdownMenu.Item onClick={() => handleDelete(agendamento.id)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg cursor-pointer outline-none">
                                                        <Trash2 className="w-4 h-4" /> Excluir
                                                    </DropdownMenu.Item>
                                                </DropdownMenu.Content>
                                            </DropdownMenu.Portal>
                                        </DropdownMenu.Root>
                                    </div>

                                    {/* Info do Relatório */}
                                    <div className="px-3 py-2 bg-slate-900/50 rounded-lg border border-white/5 text-sm text-slate-400">
                                        Relatório: <span className="text-slate-200">{agendamento.nome_relatorio}</span>
                                    </div>

                                    {/* Status da última execução */}
                                    <div className="flex items-center gap-3 text-sm border-t border-white/5 pt-4">
                                        {agendamento.ultima_execucao_detalhe ? (
                                            <>
                                                {agendamento.ultima_execucao_detalhe.sucesso ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                                )}
                                                <span className="text-slate-400">
                                                    Última: {new Date(agendamento.ultima_execucao_detalhe.iniciado_em).toLocaleDateString()}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-4 h-4 text-slate-500" />
                                                <span className="text-slate-500">Nunca executado</span>
                                            </>
                                        )}

                                        <div className="ml-auto">
                                            {agendamento.ativo ? (
                                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-slate-500/10 text-slate-400 text-xs rounded-full border border-slate-500/20">
                                                    Pausado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <AgendamentoModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                    agendamentoId={selectedId}
                />
            </div>
        </AppLayout>
    )
}
