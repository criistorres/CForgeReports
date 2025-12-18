import { useState, useEffect } from 'react'
import { Play, Download, Clock, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import api from '@/services/api'
import { useToast } from '@/hooks/useToast'

interface Filtro {
  id: string
  parametro: string
  label: string
  tipo: 'DATA' | 'TEXTO' | 'NUMERO' | 'LISTA'
  obrigatorio: boolean
  valor_padrao?: string
  opcoes?: string[]
}

interface Relatorio {
  id: string
  nome: string
  descricao?: string
  query: string
  filtros: Filtro[]
  conexao_id: string
}

interface RelatorioExecutorProps {
  relatorioId: string
  onClose: () => void
}

export function RelatorioExecutor({ relatorioId, onClose }: RelatorioExecutorProps) {
  const { showToast } = useToast()

  const [relatorio, setRelatorio] = useState<Relatorio | null>(null)
  const [loading, setLoading] = useState(true)
  const [executando, setExecutando] = useState(false)
  const [valores, setValores] = useState<Record<string, string>>({})
  const [resultado, setResultado] = useState<any[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [tempoExecucao, setTempoExecucao] = useState<number | null>(null)

  // Carregar dados do relatório
  useEffect(() => {
    carregarRelatorio()
  }, [relatorioId])

  const carregarRelatorio = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/relatorios/${relatorioId}/`)
      setRelatorio(response.data)

      // Inicializar valores com defaults
      const valoresIniciais: Record<string, string> = {}
      response.data.filtros?.forEach((filtro: Filtro) => {
        if (filtro.valor_padrao) {
          valoresIniciais[filtro.parametro] = filtro.valor_padrao
        }
      })
      setValores(valoresIniciais)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
      showToast('Erro ao carregar relatório', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExecutar = async () => {
    if (!relatorio) return

    // Validar filtros obrigatórios
    const filtrosObrigatorios = relatorio.filtros?.filter(f => f.obrigatorio) || []
    for (const filtro of filtrosObrigatorios) {
      if (!valores[filtro.parametro]) {
        showToast(`O filtro "${filtro.label}" é obrigatório`, 'error')
        return
      }
    }

    try {
      setExecutando(true)
      setErro(null)
      const inicio = Date.now()

      const response = await api.post(`/relatorios/${relatorioId}/executar/`, {
        filtros: valores
      })

      const fim = Date.now()
      setTempoExecucao(fim - inicio)
      setResultado(response.data.dados)
      showToast(`Relatório executado com sucesso! ${response.data.dados.length} linhas retornadas`, 'success')
    } catch (error: any) {
      console.error('Erro ao executar relatório:', error)
      setErro(error.response?.data?.erro || 'Erro desconhecido ao executar relatório')
      showToast('Erro ao executar relatório', 'error')
    } finally {
      setExecutando(false)
    }
  }

  const handleExportarExcel = async () => {
    if (!resultado || resultado.length === 0) {
      showToast('Nenhum dado para exportar', 'warning')
      return
    }

    try {
      const response = await api.post(`/relatorios/${relatorioId}/exportar/`, {
        filtros: valores,
        formato: 'xlsx'
      }, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${relatorio?.nome || 'relatorio'}_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      showToast('Relatório exportado com sucesso!', 'success')
    } catch (error) {
      console.error('Erro ao exportar:', error)
      showToast('Erro ao exportar relatório', 'error')
    }
  }

  const renderFiltro = (filtro: Filtro) => {
    const valor = valores[filtro.parametro] || ''

    const handleChange = (novoValor: string) => {
      setValores(prev => ({ ...prev, [filtro.parametro]: novoValor }))
    }

    switch (filtro.tipo) {
      case 'DATA':
        return (
          <input
            type="date"
            value={valor}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
            required={filtro.obrigatorio}
          />
        )

      case 'NUMERO':
        return (
          <input
            type="number"
            value={valor}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
            required={filtro.obrigatorio}
          />
        )

      case 'LISTA':
        return (
          <select
            value={valor}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
            required={filtro.obrigatorio}
          >
            <option value="">Selecione...</option>
            {filtro.opcoes?.map((opcao, idx) => (
              <option key={idx} value={opcao}>
                {opcao}
              </option>
            ))}
          </select>
        )

      case 'TEXTO':
      default:
        return (
          <input
            type="text"
            value={valor}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
            placeholder={filtro.valor_padrao || ''}
            required={filtro.obrigatorio}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-slate-400">Carregando relatório...</p>
        </div>
      </div>
    )
  }

  if (!relatorio) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-300">Relatório não encontrado</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-slate-900/50">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{relatorio.nome}</h2>
            {relatorio.descricao && (
              <p className="text-slate-400 mt-1">{relatorio.descricao}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Área de conteúdo com scroll */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Filtros */}
        {relatorio.filtros && relatorio.filtros.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatorio.filtros.map((filtro) => (
                <div key={filtro.id}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {filtro.label}
                    {filtro.obrigatorio && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {renderFiltro(filtro)}
                </div>
              ))}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleExecutar}
                disabled={executando}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {executando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Executar Relatório
                  </>
                )}
              </button>

              {resultado && (
                <button
                  onClick={handleExportarExcel}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  Exportar Excel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Resultado */}
        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-red-400 font-medium mb-1">Erro na execução</h4>
                <p className="text-slate-300 text-sm">{erro}</p>
              </div>
            </div>
          </div>
        )}

        {resultado && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Sucesso</span>
                </div>
                <span className="text-slate-400 text-sm">
                  {resultado.length} linha{resultado.length !== 1 ? 's' : ''} retornada{resultado.length !== 1 ? 's' : ''}
                </span>
                {tempoExecucao !== null && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{(tempoExecucao / 1000).toFixed(2)}s</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tabela de resultados */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    {resultado.length > 0 && Object.keys(resultado[0]).map((coluna) => (
                      <th
                        key={coluna}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                      >
                        {coluna}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {resultado.slice(0, 100).map((linha, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                      {Object.values(linha).map((valor: any, colIdx) => (
                        <td key={colIdx} className="px-4 py-3 text-sm text-slate-300">
                          {valor !== null && valor !== undefined ? String(valor) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {resultado.length > 100 && (
              <div className="p-4 bg-slate-800/30 text-center text-slate-400 text-sm">
                Mostrando apenas as primeiras 100 linhas. Exporte para ver todos os dados.
              </div>
            )}
          </div>
        )}

        {/* Estado inicial */}
        {!resultado && !erro && !executando && (
          <div className="text-center py-12 text-slate-400">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Configure os filtros e clique em "Executar Relatório"</p>
          </div>
        )}
      </div>
    </div>
  )
}
