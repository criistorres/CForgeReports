import { useState, useEffect, useMemo } from 'react'
import { FileText, Search, Plus, X } from 'lucide-react'
import api from '@/services/api'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/utils/errorMessages'

interface Relatorio {
    id: string
    nome: string
    descricao?: string
    pasta?: string | null
    pasta_id?: string | null
}

interface AdicionarRelatoriosModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    pastaDestinoId: string | null
    pastaNome: string
}

export function AdicionarRelatoriosModal({
    isOpen,
    onClose,
    onConfirm,
    pastaDestinoId,
    pastaNome
}: AdicionarRelatoriosModalProps) {
    const { showToast } = useToast()
    const [relatorios, setRelatorios] = useState<Relatorio[]>([])
    const [loading, setLoading] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [busca, setBusca] = useState('')
    const [selecionados, setSelecionados] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (isOpen) {
            carregarRelatorios()
            setSelecionados(new Set())
            setBusca('')
        }
    }, [isOpen])

    const carregarRelatorios = async () => {
        try {
            setLoading(true)
            const res = await api.get('/relatorios/')
            // Filtra relatórios que já não estão na pasta de destino
            const disponiveis = res.data.filter((r: Relatorio) =>
                (r.pasta || r.pasta_id) !== pastaDestinoId
            )
            setRelatorios(disponiveis)
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error)
            const mensagem = getErrorMessage(error)
            showToast(mensagem, 'error')
        } finally {
            setLoading(false)
        }
    }

    const relatoriosFiltrados = useMemo(() => {
        if (!busca) return relatorios
        const termo = busca.toLowerCase()
        return relatorios.filter(r =>
            r.nome.toLowerCase().includes(termo) ||
            r.descricao?.toLowerCase().includes(termo)
        )
    }, [relatorios, busca])

    const toggleSelecao = (id: string) => {
        setSelecionados(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const handleConfirmar = async () => {
        if (selecionados.size === 0) return

        try {
            setSalvando(true)
            await Promise.all(
                Array.from(selecionados).map(id =>
                    api.patch(`/relatorios/${id}/`, { pasta: pastaDestinoId })
                )
            )
            showToast(`${selecionados.size} relatório(s) adicionado(s) com sucesso`, 'success')
            onConfirm()
            onClose()
        } catch (error) {
            console.error('Erro ao adicionar relatórios:', error)
            const mensagem = getErrorMessage(error)
            showToast(mensagem, 'error')
        } finally {
            setSalvando(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl p-0 overflow-hidden border-white/5 bg-slate-900/95 backdrop-blur-xl">
                <div className="p-6 pb-0">
                    <DialogHeader>
                        <div className="flex items-center justify-between group">
                            <div>
                                <DialogTitle className="text-xl font-black text-white tracking-tight">
                                    Adicionar Relatórios
                                </DialogTitle>
                                <p className="text-sm text-slate-400 mt-1 font-medium">
                                    Adicionando à pasta <span className="text-purple-400 font-bold">"{pastaNome}"</span>
                                </p>
                            </div>
                            <div className={`p-2 rounded-xl transition-all ${selecionados.size > 0 ? 'bg-purple-500/20 text-purple-400 scale-110 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-white/5 text-slate-500'}`}>
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Busca */}
                    <div className="mt-6 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-all" />
                        <input
                            type="text"
                            placeholder="Buscar relatórios para adicionar..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 bg-white/5 text-white text-sm rounded-xl border border-white/5 focus:border-purple-500/50 focus:outline-none transition-all placeholder:text-slate-600 font-medium"
                        />
                        {busca && (
                            <button
                                onClick={() => setBusca('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-md text-slate-500 hover:text-white transition-all"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Lista */}
                <div className="mt-6 px-2 min-h-[300px] max-h-[400px] overflow-y-auto premium-scrollbar pb-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Carregando relatórios...</p>
                        </div>
                    ) : relatoriosFiltrados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                                <Search className="w-8 h-8 text-slate-700" />
                            </div>
                            <h3 className="text-white font-bold text-base">Nenhum relatório encontrado</h3>
                            <p className="text-slate-500 text-xs mt-1 font-medium leading-relaxed">
                                {busca
                                    ? "Não encontramos resultados para sua busca."
                                    : "Todos os relatórios disponíveis já estão nesta pasta ou não existem outros relatórios."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-1 px-4">
                            {relatoriosFiltrados.map(rel => {
                                const isSelected = selecionados.has(rel.id)
                                return (
                                    <div
                                        key={rel.id}
                                        onClick={() => toggleSelecao(rel.id)}
                                        className={`
                                            flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border group
                                            ${isSelected
                                                ? 'bg-purple-500/15 border-purple-500/30 text-white shadow-[0_4px_15px_rgba(0,0,0,0.1)]'
                                                : 'hover:bg-white/5 border-transparent text-slate-400 hover:text-slate-200'}
                                        `}
                                    >
                                        <div className={`p-2 rounded-lg transition-all ${isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-600 group-hover:text-slate-400'}`}>
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                {rel.nome}
                                            </p>
                                            {rel.descricao && (
                                                <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium group-hover:text-slate-400">
                                                    {rel.descricao}
                                                </p>
                                            )}
                                        </div>
                                        <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-white/10'}`}>
                                            {isSelected && <Plus className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        {selecionados.size} selecionado(s)
                    </span>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="text-slate-400 hover:text-white font-bold text-xs uppercase"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConfirmar}
                            disabled={selecionados.size === 0 || salvando}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-black px-6 shadow-lg shadow-purple-500/20 h-10 transition-all active:scale-95 text-xs uppercase tracking-wider"
                        >
                            {salvando ? 'Processando...' : `Adicionar Selecionados`}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
