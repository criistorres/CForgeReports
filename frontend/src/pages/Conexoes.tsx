import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Database,
  Server,
  Trash2,
  X,
  Save,
  Loader2,
  ChevronRight,
  Terminal,
  Lock,
  Globe,
  Activity,
  Search
} from 'lucide-react'
import api from '@/services/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/hooks/useConfirm'
import { getConnectionErrorMessage } from '@/utils/errorMessages'
import { ValidatedInput } from '@/components/ui/validated-input'
import { Button } from '@/components/ui/button'

interface Conexao {
  id: string
  nome: string
  tipo: string
  host: string
  porta: number
  database: string
  usuario: string
  ativo: boolean
  ultimo_teste_ok: boolean | null
  ultimo_teste_em: string | null
  criado_em: string
}

interface ConexaoFormData {
  nome: string
  tipo: string
  host: string
  porta: number
  database: string
  usuario: string
  senha: string
}

const DB_THEMES: Record<string, { color: string; icon: string; label: string; glow: string }> = {
  'POSTGRESQL': {
    color: 'text-indigo-400',
    glow: 'shadow-indigo-500/20',
    icon: 'Elephant', // Usaremos Database com cor específica
    label: 'PostgreSQL'
  },
  'SQLSERVER': {
    color: 'text-red-400',
    glow: 'shadow-red-500/20',
    icon: 'Database',
    label: 'SQL Server'
  },
  'MYSQL': {
    color: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    icon: 'Database',
    label: 'MySQL'
  }
}

export default function Conexoes() {
  const [conexoes, setConexoes] = useState<Conexao[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [formData, setFormData] = useState<ConexaoFormData>({
    nome: '',
    tipo: 'POSTGRESQL',
    host: 'localhost',
    porta: 5432,
    database: '',
    usuario: '',
    senha: ''
  })
  const [testando, setTestando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [testandoId, setTestandoId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showToast } = useToast()
  const { confirm, ConfirmComponent } = useConfirm()

  // Validações
  const validateNome = (value: string) => {
    if (!value.trim()) return 'Nome é obrigatório'
    if (value.length < 3) return 'Nome deve ter pelo menos 3 caracteres'
    return null
  }

  const validateHost = (value: string) => {
    if (!value.trim()) return 'Host é obrigatório'
    const hostPattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$|^(\d{1,3}\.){3}\d{1,3}$|^localhost$/
    if (!hostPattern.test(value) && value !== 'localhost') {
      return 'Host inválido. Use um hostname válido, IP ou localhost'
    }
    return null
  }

  const validatePorta = (value: string) => {
    const porta = parseInt(value)
    if (isNaN(porta)) return 'Porta deve ser um número'
    if (porta < 1 || porta > 65535) return 'Porta deve estar entre 1 e 65535'
    return null
  }

  const validateDatabase = (value: string) => {
    if (!value.trim()) return 'Database é obrigatório'
    return null
  }

  const validateUsuario = (value: string) => {
    if (!value.trim()) return 'Usuário é obrigatório'
    return null
  }

  const validateSenha = (value: string) => {
    if (!editingId && !value.trim()) return 'Senha é obrigatória'
    return null
  }

  useEffect(() => {
    fetchConexoes()
  }, [])

  async function fetchConexoes() {
    try {
      setLoading(true)
      const response = await api.get('/conexoes/')
      setConexoes(response.data)
    } catch (err) {
      showToast('Erro ao carregar conexões', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function testarConexao(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setTestandoId(id)
    try {
      const response = await api.post(`/conexoes/${id}/testar-existente/`)
      if (response.data.sucesso) {
        showToast(response.data.mensagem, 'success')
      } else {
        showToast(response.data.mensagem, 'error')
      }
      fetchConexoes()
    } catch (err: any) {
      const mensagem = getConnectionErrorMessage(err)
      showToast(mensagem, 'error')
    } finally {
      setTestandoId(null)
    }
  }

  async function deletarConexao(id: string, nome: string, e: React.MouseEvent) {
    e.stopPropagation()
    const confirmed = await confirm({
      title: 'Excluir Conexão',
      description: `Tem certeza que deseja excluir a conexão "${nome}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'destructive'
    })

    if (!confirmed) return

    try {
      await api.delete(`/conexoes/${id}/`)
      showToast('Conexão excluída com sucesso', 'success')
      fetchConexoes()
    } catch (err: any) {
      const mensagem = getConnectionErrorMessage(err)
      showToast(mensagem, 'error')
      console.error(err)
    }
  }

  function handleNovaConexao() {
    setFormData({
      nome: '',
      tipo: 'POSTGRESQL',
      host: 'localhost',
      porta: 5432,
      database: '',
      usuario: '',
      senha: ''
    })
    setErrors({})
    setEditingId(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleEditarConexao(conexao: Conexao) {
    setFormData({
      nome: conexao.nome,
      tipo: conexao.tipo,
      host: conexao.host,
      porta: conexao.porta,
      database: conexao.database,
      usuario: conexao.usuario,
      senha: ''
    })
    setErrors({})
    setEditingId(conexao.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleTipoChange(tipo: string) {
    const portas: { [key: string]: number } = {
      'SQLSERVER': 1433,
      'POSTGRESQL': 5432,
      'MYSQL': 3306
    }
    setFormData({ ...formData, tipo, porta: portas[tipo] || 5432 })
  }

  async function handleTestarFormulario() {
    setTestando(true)
    try {
      const response = await api.post('/conexoes/testar/', formData)
      if (response.data.sucesso) {
        showToast(response.data.mensagem, 'success')
      } else {
        showToast(response.data.mensagem, 'error')
      }
    } catch (err: any) {
      const mensagem = getConnectionErrorMessage(err)
      showToast(mensagem, 'error')
    } finally {
      setTestando(false)
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()

    const validationErrors: Record<string, string> = {}
    const nomeError = validateNome(formData.nome)
    const hostError = validateHost(formData.host)
    const portaError = validatePorta(formData.porta.toString())
    const databaseError = validateDatabase(formData.database)
    const usuarioError = validateUsuario(formData.usuario)
    const senhaError = validateSenha(formData.senha)

    if (nomeError) validationErrors.nome = nomeError
    if (hostError) validationErrors.host = hostError
    if (portaError) validationErrors.porta = portaError
    if (databaseError) validationErrors.database = databaseError
    if (usuarioError) validationErrors.usuario = usuarioError
    if (senhaError) validationErrors.senha = senhaError

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      showToast('Por favor, corrija os erros no formulário', 'error')
      return
    }

    setSalvando(true)
    try {
      if (editingId) {
        await api.put(`/conexoes/${editingId}/`, formData)
        showToast('Conexão atualizada com sucesso!', 'success')
      } else {
        await api.post('/conexoes/', formData)
        showToast('Conexão criada com sucesso!', 'success')
      }
      setShowForm(false)
      fetchConexoes()
    } catch (err: any) {
      const mensagem = getConnectionErrorMessage(err)
      showToast(mensagem, 'error')
      if (err.response?.data) {
        const backendErrors: Record<string, string> = {}
        Object.keys(err.response.data).forEach(key => {
          backendErrors[key] = Array.isArray(err.response.data[key])
            ? err.response.data[key][0]
            : err.response.data[key]
        })
        setErrors(backendErrors)
      }
    } finally {
      setSalvando(false)
    }
  }

  const filteredConexoes = useMemo(() => {
    return conexoes.filter(c =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.database.toLowerCase().includes(busca.toLowerCase()) ||
      c.host.toLowerCase().includes(busca.toLowerCase())
    )
  }, [conexoes, busca])

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-slate-400 font-medium animate-pulse">Sincronizando bancos de dados...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Conexões de Banco
              </h1>
            </div>
            <p className="text-slate-400">Gerencie as fontes de dados para seus relatórios</p>
          </div>
          {!showForm && (
            <Button
              onClick={handleNovaConexao}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95 border-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              NOVA CONEXÃO
            </Button>
          )}
        </div>

        {/* Formulário Moderno */}
        {showForm && (
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Server size={180} />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-white flex items-center gap-3">
                  <div className="p-1.5 bg-purple-500/20 rounded-lg">
                    <Plus className="w-5 h-5 text-purple-400" />
                  </div>
                  {editingId ? 'EDITAR CONEXÃO' : 'NOVA CONEXÃO'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSalvar} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ValidatedInput
                    label="Nome de Identificação"
                    value={formData.nome}
                    onChange={(e) => {
                      setFormData({ ...formData, nome: e.target.value })
                      setErrors({ ...errors, nome: '' })
                    }}
                    validate={validateNome}
                    error={errors.nome}
                    placeholder="Ex: Banco de Produção, Analytics..."
                    required
                    className="bg-slate-950/40 border-white/5"
                  />
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                      Motor do Banco
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => handleTipoChange(e.target.value)}
                      className="w-full h-11 bg-slate-950/40 text-white px-4 rounded-xl border border-white/5 focus:border-purple-500 focus:outline-none transition-all"
                      required
                    >
                      <option value="POSTGRESQL">PostgreSQL</option>
                      <option value="SQLSERVER">Microsoft SQL Server</option>
                      <option value="MYSQL">MySQL / MariaDB</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <div className="sm:col-span-2">
                    <ValidatedInput
                      label="Endpoint / Host"
                      value={formData.host}
                      onChange={(e) => {
                        setFormData({ ...formData, host: e.target.value })
                        setErrors({ ...errors, host: '' })
                      }}
                      validate={validateHost}
                      error={errors.host}
                      placeholder="ex: db.empresa.com.br ou 10.0.0.1"
                      required
                      className="bg-slate-950/40 border-white/5"
                    />
                  </div>
                  <ValidatedInput
                    label="Porta"
                    type="number"
                    value={formData.porta.toString()}
                    onChange={(e) => {
                      const porta = parseInt(e.target.value) || 0
                      setFormData({ ...formData, porta })
                      setErrors({ ...errors, porta: '' })
                    }}
                    validate={validatePorta}
                    error={errors.porta}
                    required
                    className="bg-slate-950/40 border-white/5"
                  />
                  <ValidatedInput
                    label="Nome do Banco"
                    value={formData.database}
                    onChange={(e) => {
                      setFormData({ ...formData, database: e.target.value })
                      setErrors({ ...errors, database: '' })
                    }}
                    validate={validateDatabase}
                    error={errors.database}
                    placeholder="database_name"
                    required
                    className="bg-slate-950/40 border-white/5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ValidatedInput
                    label="Usuário"
                    icon={<Terminal className="w-3.5 h-3.5" />}
                    value={formData.usuario}
                    onChange={(e) => {
                      setFormData({ ...formData, usuario: e.target.value })
                      setErrors({ ...errors, usuario: '' })
                    }}
                    validate={validateUsuario}
                    error={errors.usuario}
                    placeholder="admin_user"
                    required
                    className="bg-slate-950/40 border-white/5"
                  />
                  <ValidatedInput
                    label={`Credencial Secret ${editingId ? '(deixe em branco para manter)' : ''}`}
                    icon={<Lock className="w-3.5 h-3.5" />}
                    type="password"
                    value={formData.senha}
                    onChange={(e) => {
                      setFormData({ ...formData, senha: e.target.value })
                      setErrors({ ...errors, senha: '' })
                    }}
                    validate={validateSenha}
                    error={errors.senha}
                    placeholder="••••••••"
                    required={!editingId}
                    className="bg-slate-950/40 border-white/5"
                  />
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                  <Button
                    type="button"
                    onClick={handleTestarFormulario}
                    disabled={testando}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold h-11 px-6 rounded-xl border border-white/5 shadow-inner"
                  >
                    {testando ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Activity className="w-4 h-4 mr-2" />
                    )}
                    TESTAR CONEXÃO
                  </Button>
                  <Button
                    type="submit"
                    disabled={salvando}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-emerald-500/20 flex-1 sm:flex-none border-0"
                  >
                    {salvando ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {editingId ? 'ATUALIZAR' : 'CRIAR CONEXÃO'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="ghost"
                    className="text-slate-500 hover:text-white h-11 px-6"
                  >
                    CANCELAR
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and List */}
        {!showForm && (
          <div className="space-y-6">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="text"
                placeholder="Pesquisar por nome, host ou banco..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-900/40 text-white rounded-2xl border border-white/5 focus:border-purple-500/50 focus:outline-none transition-all backdrop-blur-sm shadow-inner placeholder:text-slate-600"
              />
            </div>

            {filteredConexoes.length === 0 ? (
              <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-20 text-center backdrop-blur-sm">
                <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <Database className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">
                  {busca ? 'Nenhuma conexão encontrada' : 'Comece a conectar seus bancos'}
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">
                  {busca ? 'Ajuste sua busca para encontrar o que precisa.' : 'Adicione sua primeira fonte de dados para começar a gerar relatórios dinâmicos.'}
                </p>
                {!busca && (
                  <Button
                    onClick={handleNovaConexao}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-purple-500/20 border-0"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    NOVA CONEXÃO
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredConexoes.map((conexao) => {
                  const theme = DB_THEMES[conexao.tipo] || DB_THEMES.POSTGRESQL
                  const statusColor = conexao.ultimo_teste_ok === true
                    ? 'bg-emerald-500 shadow-emerald-500/40'
                    : conexao.ultimo_teste_ok === false
                      ? 'bg-rose-500 shadow-rose-500/40'
                      : 'bg-slate-600'

                  return (
                    <div
                      key={conexao.id}
                      onClick={() => handleEditarConexao(conexao)}
                      className="group relative bg-slate-900/40 border border-white/5 hover:border-purple-500/30 p-6 rounded-3xl transition-all cursor-pointer backdrop-blur-sm shadow-xl"
                    >
                      {/* Status Indicator */}
                      <div className="absolute top-6 right-6 flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${statusColor} shadow-[0_0_12px_rgba(0,0,0,0.5)]`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          {conexao.ultimo_teste_ok === true ? 'Online' : conexao.ultimo_teste_ok === false ? 'Error' : 'Pending'}
                        </span>
                      </div>

                      {/* DB Icon & Type */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-2xl bg-slate-950/50 flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover:scale-110 ${theme.color}`}>
                          <Database size={24} />
                        </div>
                        <div>
                          <h3 className="text-white font-black text-lg truncate pr-16">{conexao.nome}</h3>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${theme.color}`}>
                            {theme.label}
                          </span>
                        </div>
                      </div>

                      {/* connection info */}
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-300 transition-colors">
                          <Globe className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-medium truncate">{conexao.host}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-300 transition-colors">
                          <Database className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-medium">{conexao.database}</span>
                        </div>
                      </div>

                      {/* Actions Section */}
                      <div className="flex items-center justify-between pt-5 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => testarConexao(conexao.id, e)}
                            disabled={testandoId === conexao.id}
                            className={`h-9 px-3 rounded-lg text-xs font-black uppercase tracking-wider ${conexao.ultimo_teste_ok === true
                              ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                              : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
                              }`}
                          >
                            {testandoId === conexao.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <Activity className="w-3.5 h-3.5 mr-1.5" />
                                TESTAR
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => deletarConexao(conexao.id, conexao.nome, e)}
                            className="h-9 w-9 p-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {ConfirmComponent}
    </AppLayout>
  )
}
