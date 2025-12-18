import { useState, useEffect } from 'react'
import { X, Folder, ChevronRight, ChevronDown } from 'lucide-react'
import type { PastaNode } from '@/components/features/FolderTree'

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
            flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
            ${selecionada ? 'bg-primary-600 text-white' : 'hover:bg-slate-700/50 text-slate-300'}
            ${desabilitada ? 'opacity-50 cursor-not-allowed' : ''}
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
                            className="p-0.5 hover:bg-slate-600 rounded"
                        >
                            {expandida ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>
                    )}
                    {!temSubpastas && <div className="w-5" />}
                    <Folder className="w-4 h-4" />
                    <span className="flex-1 text-sm">{pasta.nome}</span>
                    {desabilitada && (
                        <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">Atual</span>
                    )}
                </div>

                {temSubpastas && expandida && (
                    <div>
                        {pasta.subpastas!.map(subpasta => renderPasta(subpasta, nivel + 1))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in-up"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-700">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Mover Relatórios
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Selecione a pasta de destino para {quantidadeRelatorios} relatório(s)
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {/* Opção: Raiz (sem pasta) */}
                        <div
                            className={`
                flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors mb-3
                ${pastaDestino === null ? 'bg-primary-600 text-white' : 'hover:bg-slate-700/50 text-slate-300'}
              `}
                            onClick={() => setPastaDestino(null)}
                        >
                            <Folder className="w-4 h-4" />
                            <span className="font-medium">📁 Raiz (Sem pasta)</span>
                        </div>

                        {/* Árvore de pastas */}
                        <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-1">
                            {pastas.map(pasta => renderPasta(pasta))}
                        </div>

                        {pastas.length === 0 && (
                            <div className="text-center py-8 text-slate-400">
                                <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Nenhuma pasta disponível</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirmar}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Mover {quantidadeRelatorios} relatório(s)
                        </button>
                    </div>
                </div>
            </div>
        </>
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
