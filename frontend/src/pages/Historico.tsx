import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Play, Check, X, Filter, Calendar, User, FileText, Timer } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/hooks/useToast'
import api from '@/services/api'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { EmptyState } from '@/components/ui/empty-state'
import { getErrorMessage } from '@/utils/errorMessages'

interface Execucao {
  id: string
  relatorio_id: string
  relatorio_nome: string
  usuario_nome: string
  usuario_email: string
  iniciado_em: string
  finalizado_em: string
  tempo_execucao_ms: number
  sucesso: boolean
  erro: string | null
  qtd_linhas: number
  exportou: boolean
  filtros_usados: Record<string, any>
}

export default function Historico() {
  const [execucoes, setExecucoes] = useState<Execucao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    sucesso: '',
    relatorio_id: ''
  })
  const { showToast } = useToast()

  useEffect(() => {
    carregarHistorico()
  }, [filtros])

  async function carregarHistorico() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtros.sucesso) params.append('sucesso', filtros.sucesso)
      if (filtros.relatorio_id) params.append('relatorio_id', filtros.relatorio_id)

      const response = await api.get(`/historico/?${params.toString()}`)
      setExecucoes(response.data)
    } catch (error: any) {
      const mensagem = getErrorMessage(error)
      showToast(mensagem, 'error')
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatarDataRelativa(data: string) {
    try {
      return formatDistanceToNow(new Date(data), {
        addSuffix: true,
        locale: ptBR
      })
    } catch {
      return 'Data inválida'
    }
  }

  function formatarTempo(ms: number | null) {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400">Carregando histórico...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-400" />
            Histórico de Execuções
          </h1>
          <p className="text-slate-400 mt-1">
            Visualize todas as execuções de relatórios
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-xl mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-white">Filtros</h2>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Status</label>
              <select
                value={filtros.sucesso}
                onChange={(e) => setFiltros({ ...filtros, sucesso: e.target.value })}
                className="bg-slate-800/50 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors min-w-[150px]"
              >
                <option value="">Todos</option>
                <option value="true">✓ Sucesso</option>
                <option value="false">✗ Erro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Execuções */}
        {execucoes.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <EmptyState
              icon={Clock}
              title="Nenhuma execução encontrada"
              description="Execute um relatório para ver o histórico de execuções aqui. Você poderá ver detalhes de cada execução, incluindo tempo de processamento e resultados."
              action={{
                label: 'Ir para Dashboard',
                onClick: () => window.location.href = '/dashboard'
              }}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {execucoes.map((exec) => (
              <div
                key={exec.id}
                className="bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 p-5 rounded-xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Ícone de status */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${exec.sucesso
                      ? 'bg-green-500/20'
                      : 'bg-red-500/20'
                      }`}>
                      {exec.sucesso
                        ? <Check className="w-5 h-5 text-green-400" />
                        : <X className="w-5 h-5 text-red-400" />
                      }
                    </div>

                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-semibold">{exec.relatorio_nome}</h3>
                        {exec.sucesso ? (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            Sucesso
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                            Erro
                          </span>
                        )}
                        {exec.exportou && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            📥 Exportado
                          </span>
                        )}
                      </div>

                      {/* Erro */}
                      {exec.erro && (
                        <p className="text-red-400 text-sm mb-2 bg-red-500/10 px-3 py-2 rounded-lg">
                          {exec.erro}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatarDataRelativa(exec.iniciado_em)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {exec.usuario_nome}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Timer className="w-3.5 h-3.5" />
                          {formatarTempo(exec.tempo_execucao_ms)}
                        </span>
                        {exec.qtd_linhas > 0 && (
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            {exec.qtd_linhas.toLocaleString('pt-BR')} linhas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ação */}
                  <Link
                    to={`/relatorios/${exec.relatorio_id}/executar`}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors text-sm ml-4"
                  >
                    <Play className="w-4 h-4" />
                    Re-executar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
