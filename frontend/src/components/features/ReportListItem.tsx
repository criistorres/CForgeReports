import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Play, MoreVertical, Edit, Trash2, Copy, Clock, Calendar, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface Relatorio {
    id: string
    nome: string
    descricao?: string
    criado_em: string
    ultima_execucao?: string
    pasta?: string | null
    pasta_id?: string | null
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
          group relative forge-glass premium-hover rounded-2xl p-5 border-white/5 transition-all
          ${isSelected ? 'border-purple-500/50 bg-purple-500/10' : ''}
        `}
            >
                {/* Checkbox de seleção */}
                {onToggleSelect && (
                    <div className="absolute top-4 left-4 z-10">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={onToggleSelect}
                            className="w-4 h-4 rounded-md border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500/50"
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
                    className="absolute top-4 right-4 z-10 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all group/fav"
                >
                    <Star
                        className={`w-4 h-4 transition-all ${isFavorito ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500 group-hover/fav:text-slate-300'
                            }`}
                    />
                </button>

                <div className="mt-6 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
                        <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight">
                        {relatorio.nome}
                    </h3>
                    {relatorio.descricao && (
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{relatorio.descricao}</p>
                    )}
                </div>

                {/* Informações */}
                <div className="flex flex-col gap-2 mb-6 p-3 bg-white/5 rounded-xl border border-white/5">
                    {relatorio.criado_em && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <Calendar className="w-3 h-3 text-slate-600" />
                            <span>Criado {formatarDataRelativa(relatorio.criado_em)}</span>
                        </div>
                    )}
                    {relatorio.ultima_execucao && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3 text-slate-600" />
                            <span className="text-purple-400/80">Executado {formatarDataRelativa(relatorio.ultima_execucao)}</span>
                        </div>
                    )}
                    {!relatorio.ultima_execucao && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3 text-slate-600" />
                            <span>Nunca executado</span>
                        </div>
                    )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 mt-auto">
                    <button
                        onClick={handleExecutar}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-purple-900/20 active:scale-95"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Executar
                    </button>
                    <button
                        onClick={handleEditar}
                        className="p-2.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl transition-all border border-white/5"
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
        group flex items-center gap-4 forge-glass premium-hover rounded-2xl p-4 border-white/5 transition-all
        ${isSelected ? 'border-purple-500/50 bg-purple-500/10' : ''}
      `}
        >
            {/* Checkbox de seleção */}
            {onToggleSelect && (
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggleSelect}
                    className="w-4 h-4 rounded-md border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500/50"
                    onClick={(e) => e.stopPropagation()}
                />
            )}

            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/10">
                <FileText className="w-5 h-5 text-purple-400/80" />
            </div>

            {/* Informações */}
            <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold truncate group-hover:text-purple-400 transition-colors uppercase tracking-wide text-sm">{relatorio.nome}</h3>
                {relatorio.descricao && (
                    <p className="text-xs text-slate-500 truncate mt-0.5 leading-relaxed">{relatorio.descricao}</p>
                )}
                <div className="flex items-center gap-4 mt-1.5">
                    {relatorio.criado_em && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                            <Calendar className="w-3 h-3" />
                            <span>{formatarDataRelativa(relatorio.criado_em)}</span>
                        </div>
                    )}
                    {relatorio.ultima_execucao && (
                        <div className="flex items-center gap-1.5 text-[10px] text-purple-500/60 font-semibold uppercase tracking-tighter">
                            <Clock className="w-3 h-3" />
                            <span>{formatarDataRelativa(relatorio.ultima_execucao)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3">
                {/* Favorito */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorito(relatorio.id, !isFavorito)
                    }}
                    className="p-2 hover:bg-white/5 rounded-xl transition-all"
                >
                    <Star
                        className={`w-4 h-4 ${isFavorito ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600 hover:text-slate-400'
                            }`}
                    />
                </button>

                <button
                    onClick={handleExecutar}
                    className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 active:scale-95 shadow-lg shadow-purple-900/20"
                >
                    <Play className="w-4 h-4 fill-current" />
                    <span className="text-sm">Executar</span>
                </button>

                {/* Menu de mais opções */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2.5 hover:bg-white/10 text-slate-500 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/5"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-50"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={() => { handleEditar(); setShowMenu(false) }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-slate-300 transition-colors rounded-xl group"
                                >
                                    <Edit className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                                    <span className="text-sm">Editar Relatório</span>
                                </button>
                                <button
                                    onClick={() => { handleDuplicar(); setShowMenu(false) }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-slate-300 transition-colors rounded-xl group"
                                >
                                    <Copy className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                                    <span className="text-sm">Duplicar</span>
                                </button>
                                <div className="h-px bg-white/5 mx-2 my-1" />
                                <button
                                    onClick={() => { handleExcluir(); setShowMenu(false) }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-400 transition-colors rounded-xl group"
                                >
                                    <Trash2 className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                                    <span className="text-sm font-medium">Excluir</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
