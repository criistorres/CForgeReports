import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import FiltroInput from '../components/features/FiltroInput'
import type { Filtro } from '../components/features/FiltroForm'
import { getErrorMessage } from '../utils/errorMessages'

interface Relatorio {
  id: string
  nome: string
  descricao: string
  query_sql: string
  conexao_nome: string
  pode_exportar: boolean
}

interface ResultadoExecucao {
  sucesso: boolean
  colunas?: string[]
  dados?: any[]
  total_linhas?: number
  linhas_exibidas?: number
  tempo_ms?: number
  erro?: string
}

export default function ExecutarRelatorio() {
  const { id } = useParams()
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null)
  const [resultado, setResultado] = useState<ResultadoExecucao | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState<Filtro[]>([])
  const [valoresFiltros, setValoresFiltros] = useState<Record<string, any>>({})

  useEffect(() => {
    loadRelatorio()
    loadFiltros()
  }, [id])

  async function loadRelatorio() {
    try {
      const response = await api.get(`/relatorios/${id}/`)
      setRelatorio(response.data)
    } catch (err) {
      setError('Erro ao carregar relatório')
    }
  }

  async function loadFiltros() {
    try {
      const response = await api.get(`/relatorios/${id}/filtros/`)
      setFiltros(response.data)
      // Inicializar valores com valores padrão
      const valores: Record<string, any> = {}
      response.data.forEach((filtro: Filtro) => {
        if (filtro.valor_padrao) {
          valores[filtro.parametro] = filtro.valor_padrao
        }
      })
      setValoresFiltros(valores)
    } catch (err) {
      console.error('Erro ao carregar filtros:', err)
    }
  }

  async function executar(e?: React.FormEvent) {
    if (e) e.preventDefault()

    setLoading(true)
    setError('')
    setResultado(null)

    try {
      const response = await api.post(`/relatorios/${id}/executar/`, {
        filtros: valoresFiltros
      })
      setResultado(response.data)
    } catch (err: any) {
      const errorMsg = getErrorMessage(err)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  async function exportar() {
    setExportando(true)
    try {
      const response = await api.post(`/relatorios/${id}/exportar/`, {}, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${relatorio?.nome || 'relatorio'}_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      const errorMsg = getErrorMessage(err)
      setError(errorMsg)
    } finally {
      setExportando(false)
    }
  }

  if (!relatorio) {
    return (
      <div className="p-6">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/relatorios" className="text-slate-400 hover:text-white">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-white">{relatorio.nome}</h1>
        </div>
        {relatorio.descricao && (
          <p className="text-slate-400">{relatorio.descricao}</p>
        )}
        <p className="text-slate-500 text-sm mt-1">Conexão: {relatorio.conexao_nome}</p>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg mb-6">
        <details className="cursor-pointer">
          <summary className="text-slate-300 font-medium">Ver Query SQL</summary>
          <pre className="mt-3 bg-slate-900 p-4 rounded text-sm text-slate-300 overflow-x-auto">
            {relatorio.query_sql}
          </pre>
        </details>
      </div>

      {filtros.length > 0 ? (
        <form onSubmit={executar} className="bg-slate-800 p-6 rounded-lg mb-6 space-y-6">
          <h3 className="text-lg font-semibold text-white">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtros.map((filtro) => (
              <FiltroInput
                key={filtro.parametro}
                filtro={filtro}
                value={valoresFiltros[filtro.parametro]}
                onChange={(valor) => setValoresFiltros({ ...valoresFiltros, [filtro.parametro]: valor })}
              />
            ))}
          </div>
          <div className="flex gap-4 pt-4 border-t border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition disabled:opacity-50"
            >
              {loading ? 'Executando...' : 'Executar Relatório'}
            </button>
            {resultado?.sucesso && relatorio?.pode_exportar && (
              <button
                type="button"
                onClick={exportar}
                disabled={exportando}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition disabled:opacity-50"
              >
                {exportando ? 'Exportando...' : 'Exportar Excel'}
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="flex gap-4 mb-6">
          <button
            onClick={executar}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition disabled:opacity-50"
          >
            {loading ? 'Executando...' : 'Executar Relatório'}
          </button>
          {resultado?.sucesso && relatorio?.pode_exportar && (
            <button
              onClick={exportar}
              disabled={exportando}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition disabled:opacity-50"
            >
              {exportando ? 'Exportando...' : 'Exportar Excel'}
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {resultado?.sucesso && (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="bg-slate-700 px-4 py-3 flex justify-between items-center text-sm">
            <div className="text-slate-300">
              <span className="font-semibold">{resultado.linhas_exibidas}</span> de{' '}
              <span className="font-semibold">{resultado.total_linhas}</span> linhas
              {resultado.total_linhas! > resultado.linhas_exibidas! && (
                <span className="text-yellow-400 ml-2">
                  (exibindo apenas primeiras {resultado.linhas_exibidas})
                </span>
              )}
            </div>
            <div className="text-slate-400">
              Tempo: <span className="font-semibold">{resultado.tempo_ms}ms</span>
            </div>
          </div>

          <div className="overflow-auto max-h-[600px]">
            <table className="w-full">
              <thead className="bg-slate-700 sticky top-0">
                <tr>
                  {resultado.colunas?.map((col: string) => (
                    <th key={col} className="text-left p-3 text-slate-300 font-semibold whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultado.dados?.map((row: any, i: number) => (
                  <tr key={i} className="border-t border-slate-700 hover:bg-slate-700/50">
                    {resultado.colunas?.map((col: string) => (
                      <td key={col} className="p-3 text-white whitespace-nowrap">
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : (
                          <span className="text-slate-500 italic">null</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {resultado && !resultado.sucesso && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded">
          <div className="font-semibold mb-2">Erro na execução:</div>
          <pre className="text-sm whitespace-pre-wrap">{resultado.erro}</pre>
        </div>
      )}
    </div>
  )
}
