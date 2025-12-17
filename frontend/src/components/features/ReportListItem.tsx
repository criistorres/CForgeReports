import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Play, FileText } from 'lucide-react'
import api from '@/services/api'

export interface Relatorio {
  id: string
  nome: string
  descricao: string
  conexao_nome?: string
  pasta_nome?: string
  criado_em: string
  ultima_execucao?: string
}

interface ReportListItemProps {
    relatorio: Relatorio
    isFavorito: boolean
    onToggleFavorito: (relatorioId: string, novoEstado: boolean) => void
}

export function ReportListItem({ relatorio, isFavorito, onToggleFavorito }: ReportListItemProps) {
    const navigate = useNavigate()
    const [isHovered, setIsHovered] = useState(false)
    const [favoritoLoading, setFavoritoLoading] = useState(false)

    const handleFavoritoClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (favoritoLoading) return

        setFavoritoLoading(true)
        try {
            if (isFavorito) {
                await api.delete(`/favoritos/${relatorio.id}/`)
                onToggleFavorito(relatorio.id, false)
            } else {
                await api.post('/favoritos/', { relatorio_id: relatorio.id })
                onToggleFavorito(relatorio.id, true)
            }
        } catch (error) {
            console.error('Erro ao atualizar favorito:', error)
        } finally {
            setFavoritoLoading(false)
        }
    }

    const handleAbrir = () => {
        navigate(`/relatorios/${relatorio.id}/executar`)
    }

    const formatarData = (dataString?: string) => {
        if (!dataString) return 'Nunca executado'
        const data = new Date(dataString)
        const agora = new Date()
        const diff = agora.getTime() - data.getTime()

        const minutos = Math.floor(diff / 60000)
        const horas = Math.floor(diff / 3600000)
        const dias = Math.floor(diff / 86400000)

        if (minutos < 60) return `${minutos}min atrás`
        if (horas < 24) return `${horas}h atrás`
        if (dias < 7) return `${dias}d atrás`
        return data.toLocaleDateString('pt-BR')
    }

    return (
        <div
            className={`
        group flex items-center gap-4 px-4 py-3 rounded-lg transition-all cursor-pointer
        ${isHovered ? 'bg-slate-700/60' : 'bg-slate-800/40 hover:bg-slate-700/40'}
      `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleAbrir}
        >
            {/* Ícone do relatório */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
            </div>

            {/* Info do relatório */}
            <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{relatorio.nome}</h4>
                {relatorio.descricao && (
                    <p className="text-sm text-slate-400 truncate">{relatorio.descricao}</p>
                )}
            </div>

            {/* Data última execução */}
            <div className="text-sm text-slate-500 hidden md:block">
                {formatarData(relatorio.ultima_execucao)}
            </div>

            {/* Ações (aparecem no hover) */}
            <div className={`flex items-center gap-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                {/* Botão Favorito */}
                <button
                    onClick={handleFavoritoClick}
                    disabled={favoritoLoading}
                    className={`
            p-2 rounded-lg transition-all
            ${isFavorito
                            ? 'text-yellow-400 hover:bg-yellow-500/20'
                            : 'text-slate-400 hover:text-yellow-400 hover:bg-slate-600/50'
                        }
          `}
                    title={isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                    <Star className={`w-4 h-4 ${isFavorito ? 'fill-current' : ''}`} />
                </button>

                {/* Botão Abrir */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        handleAbrir()
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Play className="w-4 h-4" />
                    Abrir
                </button>
            </div>

            {/* Favorito visível quando não hover (se for favorito) */}
            {!isHovered && isFavorito && (
                <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
            )}
        </div>
    )
}
