import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import FiltroForm from '../components/features/FiltroForm'
import PermissoesForm from '../components/forge/PermissoesForm'
import type { Filtro } from '../components/features/FiltroForm'
import { useAuth } from '../contexts/AuthContext'

interface Conexao {
  id: string
  nome: string
}

interface RelatorioData {
  nome: string
  descricao: string
  conexao: string
  query_sql: string
  limite_linhas_tela: number
  permite_exportar: boolean
}

export default function RelatorioForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditing = !!id
  const isAdmin = user?.role === 'ADMIN'

  const [conexoes, setConexoes] = useState<Conexao[]>([])
  const [loading, setLoading] = useState(false)
  const [testando, setTestando] = useState(false)
  const [error, setError] = useState('')
  const [resultadoTeste, setResultadoTeste] = useState<any>(null)
  const [filtros, setFiltros] = useState<Filtro[]>([])
  const [salvandoFiltros, setSalvandoFiltros] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'dados' | 'filtros' | 'permissoes'>('dados')

  const [formData, setFormData] = useState<RelatorioData>({
    nome: '',
    descricao: '',
    conexao: '',
    query_sql: 'SELECT ',
    limite_linhas_tela: 1000,
    permite_exportar: true
  })

  useEffect(() => {
    loadConexoes()
    if (isEditing) {
      loadRelatorio()
    }
  }, [id])

  async function loadConexoes() {
    try {
      const response = await api.get('/conexoes/')
      setConexoes(response.data)
    } catch (err) {
      setError('Erro ao carregar conexões')
    }
  }

  async function loadRelatorio() {
    try {
      const response = await api.get(`/relatorios/${id}/`)
      setFormData({
        nome: response.data.nome,
        descricao: response.data.descricao || '',
        conexao: response.data.conexao,
        query_sql: response.data.query_sql,
        limite_linhas_tela: response.data.limite_linhas_tela,
        permite_exportar: response.data.permite_exportar
      })
      // Carregar filtros
      loadFiltros()
    } catch (err) {
      setError('Erro ao carregar relatório')
    }
  }

  async function loadFiltros() {
    try {
      const response = await api.get(`/relatorios/${id}/filtros/`)
      setFiltros(response.data)
    } catch (err) {
      console.error('Erro ao carregar filtros:', err)
    }
  }

  async function salvarFiltros() {
    if (!id) return

    setSalvandoFiltros(true)
    setError('')

    try {
      await api.put(`/relatorios/${id}/filtros/`, { filtros })
      alert('Filtros salvos com sucesso!')
    } catch (err: any) {
      const errorMsg = err.response?.data?.erro || 'Erro ao salvar filtros'
      setError(errorMsg)
    } finally {
      setSalvandoFiltros(false)
    }
  }

  async function handleTestar() {
    if (!formData.query_sql.trim()) {
      setError('Digite uma query SQL para testar')
      return
    }

    setTestando(true)
    setError('')
    setResultadoTeste(null)

    try {
      const response = await api.post(`/relatorios/${id}/testar/`)
      setResultadoTeste(response.data)
    } catch (err: any) {
      const errorMsg = err.response?.data?.erro || 'Erro ao testar query'
      setError(errorMsg)
    } finally {
      setTestando(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEditing) {
        await api.put(`/relatorios/${id}/`, formData)
      } else {
        await api.post('/relatorios/', formData)
      }
      navigate('/relatorios')
    } catch (err: any) {
      const errorMsg = err.response?.data?.query_sql?.[0] ||
                       err.response?.data?.erro ||
                       'Erro ao salvar relatório'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">
        {isEditing ? 'Editar Relatório' : 'Novo Relatório'}
      </h1>

      {isEditing && (
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            type="button"
            onClick={() => setAbaAtiva('dados')}
            className={`px-4 py-2 ${
              abaAtiva === 'dados'
                ? 'border-b-2 border-purple-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dados do Relatório
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('filtros')}
            className={`px-4 py-2 ${
              abaAtiva === 'filtros'
                ? 'border-b-2 border-purple-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Filtros
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setAbaAtiva('permissoes')}
              className={`px-4 py-2 ${
                abaAtiva === 'permissoes'
                  ? 'border-b-2 border-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Permissões
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" style={{ display: abaAtiva === 'dados' ? 'block' : 'none' }}>
        <div className="bg-slate-800 p-6 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nome *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Conexão *
            </label>
            <select
              value={formData.conexao}
              onChange={(e) => setFormData({ ...formData, conexao: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
              required
            >
              <option value="">Selecione uma conexão</option>
              {conexoes.map(con => (
                <option key={con.id} value={con.id}>{con.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Query SQL *
              </label>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleTestar}
                  disabled={testando}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition disabled:opacity-50"
                >
                  {testando ? 'Testando...' : 'Testar (10 linhas)'}
                </button>
              )}
            </div>
            <textarea
              value={formData.query_sql}
              onChange={(e) => setFormData({ ...formData, query_sql: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none font-mono text-sm"
              rows={12}
              placeholder="SELECT * FROM tabela WHERE ..."
              required
            />
            <p className="text-slate-500 text-xs mt-1">
              Apenas queries SELECT são permitidas
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Limite de linhas em tela
              </label>
              <input
                type="number"
                value={formData.limite_linhas_tela}
                onChange={(e) => setFormData({ ...formData, limite_linhas_tela: parseInt(e.target.value) })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                min={1}
                max={10000}
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permite_exportar}
                  onChange={(e) => setFormData({ ...formData, permite_exportar: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-slate-300">Permite exportar Excel</span>
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-4 rounded">
            {error}
          </div>
        )}

        {resultadoTeste && (
          <div className="bg-slate-800 p-4 rounded-lg">
            {resultadoTeste.sucesso ? (
              <div>
                <div className="text-green-400 font-semibold mb-2">
                  ✓ Query válida! {resultadoTeste.total_linhas} linhas encontradas
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-700">
                      <tr>
                        {resultadoTeste.colunas.map((col: string) => (
                          <th key={col} className="text-left p-2 text-slate-300">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resultadoTeste.dados.slice(0, 3).map((row: any, i: number) => (
                        <tr key={i} className="border-t border-slate-700">
                          {resultadoTeste.colunas.map((col: string) => (
                            <td key={col} className="p-2 text-white">{row[col]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-red-400">
                ✗ Erro: {resultadoTeste.erro}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/relatorios')}
            className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded transition"
          >
            Cancelar
          </button>
        </div>
      </form>

      {isEditing && abaAtiva === 'filtros' && (
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-lg">
            <FiltroForm filtros={filtros} onChange={setFiltros} />
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-400 p-4 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={salvarFiltros}
              disabled={salvandoFiltros}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition disabled:opacity-50"
            >
              {salvandoFiltros ? 'Salvando...' : 'Salvar Filtros'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/relatorios')}
              className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded transition"
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {isEditing && abaAtiva === 'permissoes' && isAdmin && (
        <div className="space-y-6">
          <PermissoesForm relatorioId={id!} />
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/relatorios')}
              className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded transition"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
