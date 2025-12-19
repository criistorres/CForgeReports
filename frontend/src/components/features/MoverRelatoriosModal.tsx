import { useState, useEffect } from 'react'
import { Folder, ChevronRight, ChevronDown } from 'lucide-react'
import type { PastaNode } from '@/components/features/FolderTree'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface MoverRelatoriosModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (pastaDestinoId: string | null) => void
    pastas: PastaNode[]
    pastaSelecionada?: string | null
    quantidadeRelatorios: number
}

export function MoverRelatoriosModal({
    isOpen,
    onClose,
    onConfirm,
    pastas,
    pastaSelecionada,
    quantidadeRelatorios
}: MoverRelatoriosModalProps) {
    const [pastaDestino, setPastaDestino] = useState<string | null>(null)
    const [pastasExpandidas, setPastasExpandidas] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (isOpen) {
            setPastaDestino(null)
            // Expande a pasta atual por padrão
            if (pastaSelecionada) {
                setPastasExpandidas(new Set([pastaSelecionada]))
            }
        }
    }, [isOpen, pastaSelecionada])

    if (!isOpen) return null

    const toggleExpansao = (pastaId: string) => {
        setPastasExpandidas(prev => {
            const newSet = new Set(prev)
            if (newSet.has(pastaId)) {
                newSet.delete(pastaId)
            } else {
                newSet.add(pastaId)
            }
            return newSet
        })
    }

    const handleConfirmar = () => {
        onConfirm(pastaDestino)
        onClose()
    }

    const renderPasta = (pasta: PastaNode, nivel: number = 0) => {
        const temSubpastas = pasta.subpastas && pasta.subpastas.length > 0
        const expandida = pastasExpandidas.has(pasta.id)
        const selecionada = pastaDestino === pasta.id
        const desabilitada = pastaSelecionada === pasta.id

        return (
            <div key={pasta.id}>
                <div
                    className={`
                        flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all border group
                        ${selecionada
                            ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                            : 'hover:bg-white/5 border-transparent text-slate-400 hover:text-slate-200'}
                        ${desabilitada ? 'opacity-40 cursor-not-allowed' : ''}
                    `}
                    style={{ paddingLeft: `${nivel * 20 + 8}px` }}
                    onClick={() => !desabilitada && setPastaDestino(pasta.id)}
                >
                    {temSubpastas && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                toggleExpansao(pasta.id)
                            }}
                            className="p-1 hover:bg-white/10 rounded-md transition-colors"
                        >
                            {expandida ? (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                            ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                            )}
                        </button>
                    )}
                    {!temSubpastas && <div className="w-5" />}
                    <div className={`p-1 rounded-lg transition-colors ${selecionada ? 'text-purple-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                        <Folder className="w-4 h-4" />
                    </div>
                    <span className={`flex-1 text-sm ${selecionada ? 'font-bold' : 'font-medium'}`}>{pasta.nome}</span>
                    {desabilitada && (
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-700/50 text-slate-500 px-2 py-0.5 rounded-full border border-white/5">Atual</span>
                    )}
                    {selecionada && !desabilitada && (
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                    )}
                </div>

                {temSubpastas && expandida && (
                    <div className="mt-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
                        {pasta.subpastas!.map(subpasta => renderPasta(subpasta, nivel + 1))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">
                        Mover Relatórios
                    </DialogTitle>
                    <p className="text-sm text-slate-400 mt-1">
                        Selecione a pasta de destino para {quantidadeRelatorios} relatório(s)
                    </p>
                </DialogHeader>

                <div className="py-4">
                    {/* Opção: Raiz (sem pasta) */}
                    <div
                        className={`
                            flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-4 border
                            ${pastaDestino === null
                                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-lg shadow-purple-900/10'
                                : 'hover:bg-white/5 border-transparent text-slate-300'}
                        `}
                        onClick={() => setPastaDestino(null)}
                    >
                        <div className={`p-1.5 rounded-lg ${pastaDestino === null ? 'bg-purple-500/20' : 'bg-slate-800'}`}>
                            <Folder className={`w-4 h-4 ${pastaDestino === null ? 'text-purple-400' : 'text-slate-500'}`} />
                        </div>
                        <span className="font-semibold text-sm">Raiz (Nível Principal)</span>
                        {pastaDestino === null && (
                            <div className="ml-auto w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                        )}
                    </div>

                    {/* Árvore de pastas */}
                    <div className="max-h-[300px] overflow-y-auto premium-scrollbar pr-2 space-y-1">
                        {pastas.map(pasta => renderPasta(pasta))}

                        {pastas.length === 0 && (
                            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                                <Folder className="w-12 h-12 mx-auto mb-3 text-slate-600 opacity-20" />
                                <p className="text-slate-500 text-sm">Nenhuma pasta criada</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 mt-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmar}
                        className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"
                    >
                        Mover {quantidadeRelatorios} relatório(s)
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Hook auxiliar para usar o modal
export function useMoverRelatoriosModal() {
    const [isOpen, setIsOpen] = useState(false)

    const abrir = () => setIsOpen(true)
    const fechar = () => setIsOpen(false)

    return {
        isOpen,
        abrir,
        fechar
    }
}
