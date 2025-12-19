import { useState, useEffect } from 'react'
import { Play, Download, Clock, X, Loader2, AlertCircle, CheckCircle, Star } from 'lucide-react'
import api from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { DataTable } from './DataTable'
import { getErrorMessage } from '@/utils/errorMessages'

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
  pode_exportar: boolean
  permite_exportar: boolean
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
  const [isFavorito, setIsFavorito] = useState(false)

  // Carregar dados do relatório
  useEffect(() => {
    carregarRelatorio()
    checkFavorito()
  }, [relatorioId])

  const checkFavorito = async () => {
    try {
      const response = await api.get('/favoritos/')
      const favoritos = response.data
      setIsFavorito(favoritos.some((f: any) => f.relatorio_id === relatorioId))
    } catch (error) {
      console.error('Erro ao verificar favoritos:', error)
    }
  }

  const toggleFavorito = async () => {
    try {
      if (isFavorito) {
        await api.delete(`/favoritos/${relatorioId}/`)
        setIsFavorito(false)
        showToast('Removido dos favoritos', 'success')
      } else {
        await api.post('/favoritos/', { relatorio_id: relatorioId })
        setIsFavorito(true)
        showToast('Adicionado aos favoritos', 'success')
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error)
      showToast('Erro ao atualizar favorito', 'error')
    }
  }

  // Função centralizada para executar o relatório
  const executarRelatorioInternal = async (valoresParaExecutar: Record<string, string>, relatorioAtual: Relatorio) => {
    try {
      setExecutando(true)
      setErro(null)
      const inicio = Date.now()

      const response = await api.post(`/relatorios/${relatorioAtual.id}/executar/`, {
        filtros: valoresParaExecutar
      })

      const fim = Date.now()
      const resultado = response.data

      // Verificar se a execução foi bem-sucedida
      if (!resultado.sucesso) {
        throw new Error(resultado.erro || 'Erro ao executar relatório')
      }

      // Verificar se os dados existem
      if (!resultado.dados || !Array.isArray(resultado.dados)) {
        throw new Error('Resposta do servidor sem dados válidos')
      }

      setTempoExecucao(resultado.tempo_ms || (fim - inicio))
      setResultado(resultado.dados)
      showToast(`Relatório executado com sucesso! ${resultado.dados.length} linhas retornadas`, 'success')
    } catch (error: any) {
      console.error('Erro ao executar relatório:', error)
      const erroMsg = getErrorMessage(error)
      setErro(erroMsg)
      showToast(erroMsg, 'error')
    } finally {
      setExecutando(false)
    }
  }

  const carregarRelatorio = async () => {
    try {
      setLoading(true)
      setResultado(null)
      setErro(null)
      const response = await api.get(`/relatorios/${relatorioId}/`)
      const relatorioData = response.data
      setRelatorio(relatorioData)

      // Inicializar valores com defaults ou vazio
      const valoresIniciais: Record<string, string> = {}
      relatorioData.filtros?.forEach((filtro: Filtro) => {
        valoresIniciais[filtro.parametro] = filtro.valor_padrao || ''
      })
      setValores(valoresIniciais)

      // Executar automaticamente APENAS se não houver nenhum filtro
      const temFiltros = relatorioData.filtros && relatorioData.filtros.length > 0

      // Executar automaticamente se não houver filtros
      if (!temFiltros) {
        executarRelatorioInternal(valoresIniciais, relatorioData)
      }

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

    await executarRelatorioInternal(valores, relatorio)
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
    } catch (error: any) {
      console.error('Erro ao exportar:', error)
      const erroMsg = getErrorMessage(error)
      showToast(erroMsg, 'error')
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
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
            required={filtro.obrigatorio}
          />
        )

      case 'NUMERO':
        return (
          <input
            type="number"
            value={valor}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
            required={filtro.obrigatorio}
          />
        )

      case 'LISTA':
        return (
          <select
            value={valor}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
            required={filtro.obrigatorio}
          >
            <option value="" className="bg-slate-900">Selecione...</option>
            {filtro.opcoes?.map((opcao, idx) => (
              <option key={idx} value={opcao} className="bg-slate-900">
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
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
            placeholder={filtro.valor_padrao || ''}
            required={filtro.obrigatorio}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            </div>
          </div>
          <p className="text-slate-400 font-medium tracking-wide">Carregando relatório...</p>
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
    <div className="h-full flex flex-col bg-slate-900/50 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-800/30 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white flex items-center gap-4">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <Play className="w-5 h-5 text-purple-400 fill-current" />
              </div>
              {relatorio.nome}
              <button
                onClick={toggleFavorito}
                className="focus:outline-none transition-all hover:scale-110 active:scale-90"
                title={isFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <Star
                  className={`w-6 h-6 transition-all ${isFavorito
                    ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]'
                    : 'text-slate-600 hover:text-yellow-400'
                    }`}
                />
              </button>
            </h2>
            {relatorio.descricao && (
              <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">{relatorio.descricao}</p>
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

      {/* Área de conteúdo com scroll vertical apenas */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 min-w-0">
        {/* Filtros */}
        {relatorio.filtros && relatorio.filtros.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 min-w-0">
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

            {/* Botão Executar */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleExecutar}
                disabled={executando}
                className="flex items-center gap-3 px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl transition-all font-bold shadow-lg shadow-purple-900/20 active:scale-95"
              >
                {executando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    Executar Relatório
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Botão Exportar - aparece quando há resultado e usuário tem permissão */}
        {resultado && relatorio.pode_exportar && relatorio.permite_exportar && (
          <div className="flex gap-3">
            <button
              onClick={handleExportarExcel}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Exportar Excel
            </button>
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
          <div className="space-y-4 min-w-0">
            {/* Header com informações */}
            <div className="flex items-center gap-4 px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-lg min-w-0">
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

            {/* Tabela com TanStack Table */}
            <DataTable data={resultado} />
          </div>
        )}

        {/* Estado inicial - só mostra se há filtros e nenhum resultado ainda */}
        {!resultado && !erro && !executando && relatorio?.filtros && relatorio.filtros.length > 0 && (
          <div className="text-center py-12 text-slate-400">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Preencha os filtros e clique em "Executar Relatório"</p>
          </div>
        )}
      </div>
    </div>
  )
}
