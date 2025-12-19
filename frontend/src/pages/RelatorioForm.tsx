import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ChevronRight, Save, ArrowLeft, Play, FileText, Filter, Shield } from 'lucide-react'
import api from '@/services/api'
import { AppLayout } from '@/components/layout/AppLayout'
import FiltroForm from '@/components/features/FiltroForm'
import PermissoesForm from '@/components/forge/PermissoesForm'
import type { Filtro } from '@/components/features/FiltroForm'
import type { PastaNode } from '@/components/features/FolderTree'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'

interface Conexao {
  id: string
  nome: string
}

interface RelatorioData {
  nome: string
  descricao: string
  pasta: string
  conexao: string
  query_sql: string
  limite_linhas_tela: number
  permite_exportar: boolean
}

export default function RelatorioForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const isEditing = !!id
  const isAdmin = user?.role === 'ADMIN'

  const [conexoes, setConexoes] = useState<Conexao[]>([])
  const [pastas, setPastas] = useState<PastaNode[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [testando, setTestando] = useState(false)
  const [resultadoTeste, setResultadoTeste] = useState<any>(null)
  const [filtros, setFiltros] = useState<Filtro[]>([])
  const [salvandoFiltros, setSalvandoFiltros] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'dados' | 'filtros' | 'permissoes'>('dados')

  const [formData, setFormData] = useState<RelatorioData>({
    nome: '',
    descricao: '',
    pasta: '',
    conexao: '',
    query_sql: 'SELECT ',
    limite_linhas_tela: 1000,
    permite_exportar: true
  })

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    setLoadingData(true)
    try {
      const [conexoesRes, pastasRes] = await Promise.all([
        api.get('/conexoes/'),
        api.get('/pastas/')
      ])
      setConexoes(conexoesRes.data)
      setPastas(pastasRes.data)

      if (isEditing) {
        const relatorioRes = await api.get(`/relatorios/${id}/`)
        setFormData({
          nome: relatorioRes.data.nome,
          descricao: relatorioRes.data.descricao || '',
          pasta: relatorioRes.data.pasta || '',
          conexao: relatorioRes.data.conexao,
          query_sql: relatorioRes.data.query_sql,
          limite_linhas_tela: relatorioRes.data.limite_linhas_tela,
          permite_exportar: relatorioRes.data.permite_exportar
        })

        // Carregar filtros
        const filtrosRes = await api.get(`/relatorios/${id}/filtros/`)
        setFiltros(filtrosRes.data)
      }
    } catch (err) {
      showToast('Erro ao carregar dados', 'error')
    } finally {
      setLoadingData(false)
    }
  }

  // Cria uma lista plana de pastas com seus caminhos completos
  function getPastasComCaminho(): Array<{ id: string; caminho: string; nivel: number }> {
    const pastaMap = new Map<string, PastaNode>()
    pastas.forEach(p => pastaMap.set(p.id, p))

    function getCaminho(pasta: PastaNode, nivel = 0): string {
      if (!pasta.pasta_pai) {
        return pasta.nome
      }
      const pai = pastaMap.get(pasta.pasta_pai)
      if (!pai) return pasta.nome
      return getCaminho(pai, nivel + 1) + ' > ' + pasta.nome
    }

    function getNivel(pasta: PastaNode): number {
      if (!pasta.pasta_pai) return 0
      const pai = pastaMap.get(pasta.pasta_pai)
      if (!pai) return 0
      return getNivel(pai) + 1
    }

    return pastas
      .map(p => ({
        id: p.id,
        caminho: getCaminho(p),
        nivel: getNivel(p)
      }))
      .sort((a, b) => a.caminho.localeCompare(b.caminho))
  }

  async function salvarFiltros() {
    if (!id) return

    setSalvandoFiltros(true)

    try {
      await api.put(`/relatorios/${id}/filtros/`, { filtros })
      showToast('Filtros salvos com sucesso!', 'success')
    } catch (err: any) {
      const errorMsg = err.response?.data?.erro || 'Erro ao salvar filtros'
      showToast(errorMsg, 'error')
    } finally {
      setSalvandoFiltros(false)
    }
  }

  async function handleTestar() {
    if (!formData.query_sql.trim()) {
      showToast('Digite uma query SQL para testar', 'warning')
      return
    }

    setTestando(true)
    setResultadoTeste(null)

    try {
      const response = await api.post(`/relatorios/${id}/testar/`)
      setResultadoTeste(response.data)
      if (response.data.sucesso) {
        showToast(`Query válida! ${response.data.total_linhas} linhas encontradas`, 'success')
      } else {
        showToast('Erro na query', 'error')
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.erro || 'Erro ao testar query'
      showToast(errorMsg, 'error')
    } finally {
      setTestando(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing) {
        await api.put(`/relatorios/${id}/`, formData)
        showToast('Relatório atualizado com sucesso!', 'success')
      } else {
        await api.post('/relatorios/', formData)
        showToast('Relatório criado com sucesso!', 'success')
      }
      navigate('/dashboard')
    } catch (err: any) {
      const errorMsg = err.response?.data?.query_sql?.[0] ||
        err.response?.data?.erro ||
        'Erro ao salvar relatório'
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400">Carregando...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <Link to="/relatorios" className="text-slate-400 hover:text-white transition-colors">
            Relatórios
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-white">
            {isEditing ? 'Editar' : 'Novo'}
          </span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Editar Relatório' : 'Novo Relatório'}
            </h1>
            {isEditing && formData.nome && (
              <p className="text-slate-400 mt-1">{formData.nome}</p>
            )}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>

        {/* Tabs */}
        {isEditing && (
          <div className="flex gap-1 mb-6 bg-slate-800/50 p-1 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setAbaAtiva('dados')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${abaAtiva === 'dados'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
            >
              <FileText className="w-4 h-4" />
              Dados
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva('filtros')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${abaAtiva === 'filtros'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setAbaAtiva('permissoes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${abaAtiva === 'permissoes'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                <Shield className="w-4 h-4" />
                Permissões
              </button>
            )}
          </div>
        )}

        {/* Form - Dados */}
        <form onSubmit={handleSubmit} className="space-y-6" style={{ display: abaAtiva === 'dados' ? 'block' : 'none' }}>
          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome do Relatório *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-slate-800/50 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Ex: Relatório de Vendas Mensal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Pasta
                </label>
                <select
                  value={formData.pasta}
                  onChange={(e) => setFormData({ ...formData, pasta: e.target.value })}
                  className="w-full bg-slate-800/50 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors"
                >
                  <option value="">📁 Raiz (sem pasta)</option>
                  {getPastasComCaminho().map(({ id, caminho, nivel }) => (
                    <option key={id} value={id}>
                      {'  '.repeat(nivel)}📁 {caminho}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full bg-slate-800/50 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                rows={2}
                placeholder="Descreva o objetivo do relatório..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Conexão *
              </label>
              <select
                value={formData.conexao}
                onChange={(e) => setFormData({ ...formData, conexao: e.target.value })}
                className="w-full bg-slate-800/50 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors"
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
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-white border border-purple-500/30 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                    {testando ? 'Testando...' : 'Testar Query'}
                  </button>
                )}
              </div>
              <textarea
                value={formData.query_sql}
                onChange={(e) => setFormData({ ...formData, query_sql: e.target.value })}
                className="w-full bg-slate-900 text-purple-400 px-4 py-3 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none font-mono text-sm"
                rows={10}
                placeholder="SELECT * FROM tabela WHERE ..."
                required
              />
              <p className="text-slate-500 text-xs mt-2">
                💡 Use parâmetros como <code className="bg-slate-700 px-1 rounded">{'{{nome_filtro}}'}</code> para criar filtros dinâmicos
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Limite de linhas em tela
                </label>
                <input
                  type="number"
                  value={formData.limite_linhas_tela}
                  onChange={(e) => setFormData({ ...formData, limite_linhas_tela: parseInt(e.target.value) })}
                  className="w-full bg-slate-800/50 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors"
                  min={1}
                  max={10000}
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    checked={formData.permite_exportar}
                    onChange={(e) => setFormData({ ...formData, permite_exportar: e.target.checked })}
                    className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-300">Permitir exportação para Excel</span>
                </label>
              </div>
            </div>
          </div>

          {/* Resultado do teste */}
          {resultadoTeste && (
            <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl">
              {resultadoTeste.sucesso ? (
                <div>
                  <div className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                    ✓ Query válida! {resultadoTeste.total_linhas} linhas encontradas
                  </div>
                  <div className="overflow-auto rounded-lg border border-slate-700">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-700/50">
                        <tr>
                          {resultadoTeste.colunas.map((col: string) => (
                            <th key={col} className="text-left p-3 text-slate-300 font-medium">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resultadoTeste.dados.slice(0, 3).map((row: any, i: number) => (
                          <tr key={i} className="border-t border-slate-700">
                            {resultadoTeste.colunas.map((col: string) => (
                              <td key={col} className="p-3 text-white">{row[col]}</td>
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

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium shadow-lg shadow-purple-900/20"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar Relatório'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>

        {/* Tab - Filtros */}
        {isEditing && abaAtiva === 'filtros' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl">
              <FiltroForm filtros={filtros} onChange={setFiltros} />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={salvarFiltros}
                disabled={salvandoFiltros}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium shadow-lg shadow-purple-900/20"
              >
                <Save className="w-4 h-4" />
                {salvandoFiltros ? 'Salvando...' : 'Salvar Filtros'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        )}

        {/* Tab - Permissões */}
        {isEditing && abaAtiva === 'permissoes' && isAdmin && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl">
              <PermissoesForm relatorioId={id!} />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
