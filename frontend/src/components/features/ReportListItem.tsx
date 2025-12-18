import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Play, MoreVertical, Edit, Trash2, Copy, Clock, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface Relatorio {
    id: string
    nome: string
    descricao?: string
    criado_em: string
    ultima_execucao?: string
    pasta?: string | null
    pasta_id?: string
}

interface ReportListItemProps {
    relatorio: Relatorio
    isFavorito: boolean
    onToggleFavorito: (id: string, novoEstado: boolean) => void
    isSelected?: boolean
    onToggleSelect?: () => void
    layoutType?: 'list' | 'grid'
}

export function ReportListItem({
    relatorio,
    isFavorito,
    onToggleFavorito,
    isSelected,
    onToggleSelect,
    layoutType = 'list'
}: ReportListItemProps) {
    const navigate = useNavigate()
    const [showMenu, setShowMenu] = useState(false)

    const handleExecutar = () => {
        navigate(`/relatorios/${relatorio.id}/executar`)
    }

    const handleEditar = () => {
        navigate(`/relatorios/${relatorio.id}/editar`)
    }

    const handleDuplicar = () => {
        // TODO: Implementar duplicação
        console.log('Duplicar relatório:', relatorio.id)
    }

    const handleExcluir = () => {
        if (confirm(`Tem certeza que deseja excluir "${relatorio.nome}"?`)) {
            // TODO: Implementar exclusão
            console.log('Excluir relatório:', relatorio.id)
        }
    }

    const formatarDataRelativa = (data: string) => {
        try {
            return formatDistanceToNow(new Date(data), {
                addSuffix: true,
                locale: ptBR
            })
        } catch {
            return 'Data inválida'
        }
    }

    if (layoutType === 'grid') {
        return (
            <div
                className={`
          group relative bg-slate-800/50 border rounded-lg p-4 hover:border-primary-500/50 transition-all
          ${isSelected ? 'border-primary-500 bg-primary-500/10' : 'border-slate-700'}
        `}
            >
                {/* Checkbox de seleção */}
                {onToggleSelect && (
                    <div className="absolute top-3 left-3 z-10">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={onToggleSelect}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-primary-600 focus:ring-primary-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

                {/* Favorito */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorito(relatorio.id, !isFavorito)
                    }}
                    className="absolute top-3 right-3 z-10 p-1 hover:scale-110 transition-transform"
                >
                    <Star
                        className={`w-5 h-5 ${isFavorito ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'
                            }`}
                    />
                </button>

                <div className="mt-8 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {relatorio.nome}
                    </h3>
                    {relatorio.descricao && (
                        <p className="text-sm text-slate-400 line-clamp-2">{relatorio.descricao}</p>
                    )}
                </div>

                {/* Informações */}
                <div className="space-y-2 mb-4">
                    {relatorio.criado_em && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>Criado {formatarDataRelativa(relatorio.criado_em)}</span>
                        </div>
                    )}
                    {relatorio.ultima_execucao && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>Executado {formatarDataRelativa(relatorio.ultima_execucao)}</span>
                        </div>
                    )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExecutar}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors text-sm"
                    >
                        <Play className="w-4 h-4" />
                        Executar
                    </button>
                    <button
                        onClick={handleEditar}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )
    }

    // Layout de lista
    return (
        <div
            className={`
        group flex items-center gap-4 bg-slate-800/50 border rounded-lg p-4 hover:border-primary-500/50 transition-all
        ${isSelected ? 'border-primary-500 bg-primary-500/10' : 'border-slate-700'}
      `}
        >
            {/* Checkbox de seleção */}
            {onToggleSelect && (
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggleSelect}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-primary-600 focus:ring-primary-500"
                    onClick={(e) => e.stopPropagation()}
                />
            )}

            {/* Favorito */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorito(relatorio.id, !isFavorito)
                }}
                className="p-1 hover:scale-110 transition-transform"
            >
                <Star
                    className={`w-5 h-5 ${isFavorito ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'
                        }`}
                />
            </button>

            {/* Informações */}
            <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{relatorio.nome}</h3>
                {relatorio.descricao && (
                    <p className="text-sm text-slate-400 truncate">{relatorio.descricao}</p>
                )}
                <div className="flex items-center gap-4 mt-1">
                    {relatorio.criado_em && (
                        <span className="text-xs text-slate-500">
                            Criado {formatarDataRelativa(relatorio.criado_em)}
                        </span>
                    )}
                    {relatorio.ultima_execucao && (
                        <span className="text-xs text-slate-500">
                            Executado {formatarDataRelativa(relatorio.ultima_execucao)}
                        </span>
                    )}
                </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleExecutar}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Play className="w-4 h-4" />
                    Executar
                </button>

                <button
                    onClick={handleEditar}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Edit className="w-4 h-4" />
                </button>

                {/* Menu de mais opções */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 py-1">
                                <button
                                    onClick={() => {
                                        handleDuplicar()
                                        setShowMenu(false)
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-700 text-slate-300 transition-colors text-left"
                                >
                                    <Copy className="w-4 h-4" />
                                    Duplicar
                                </button>
                                <button
                                    onClick={() => {
                                        handleExcluir()
                                        setShowMenu(false)
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-700 text-red-400 transition-colors text-left"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
