import { useState, useEffect } from 'react'
import { Plus, Database, Server, Play, Edit, Trash2, Check, X, AlertCircle, Save, Loader2 } from 'lucide-react'
import api from '@/services/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/hooks/useConfirm'
import { getConnectionErrorMessage } from '@/utils/errorMessages'
import { ValidatedInput } from '@/components/ui/validated-input'

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

export default function Conexoes() {
  const [conexoes, setConexoes] = useState<Conexao[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
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
    // Validação básica de hostname/IP
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
    if (value.length < 1) return 'Database é obrigatório'
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

  async function testarConexao(id: string) {
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

  async function deletarConexao(id: string, nome: string) {
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
    
    // Validação antes de enviar
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
    setErrors({})

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
      
      // Se houver erros de validação do backend, mostrar nos campos
      if (err.response?.data) {
        const backendErrors: Record<string, string> = {}
        Object.keys(err.response.data).forEach(key => {
          if (Array.isArray(err.response.data[key])) {
            backendErrors[key] = err.response.data[key][0]
          } else {
            backendErrors[key] = err.response.data[key]
          }
        })
        setErrors(backendErrors)
      }
    } finally {
      setSalvando(false)
    }
  }

  function getTipoBadge(tipo: string) {
    const badges: { [key: string]: { color: string; icon: string } } = {
      'POSTGRESQL': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '🐘' },
      'SQLSERVER': { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '🔷' },
      'MYSQL': { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: '🐬' }
    }
    return badges[tipo] || { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: '💾' }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400">Carregando conexões...</p>
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-primary-400" />
              Conexões de Banco
            </h1>
            <p className="text-slate-400 mt-1">Gerencie suas conexões de banco de dados</p>
          </div>
          <button
            onClick={handleNovaConexao}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Conexão
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary-400" />
              {editingId ? 'Editar Conexão' : 'Nova Conexão'}
            </h2>

            <form onSubmit={handleSalvar} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <ValidatedInput
                  label="Nome da Conexão"
                  value={formData.nome}
                  onChange={(e) => {
                    setFormData({ ...formData, nome: e.target.value })
                    setErrors({ ...errors, nome: '' })
                  }}
                  validate={validateNome}
                  error={errors.nome}
                  placeholder="Ex: Produção, Desenvolvimento..."
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tipo de Banco *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => handleTipoChange(e.target.value)}
                    className="w-full bg-slate-800/50 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-primary-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="POSTGRESQL">🐘 PostgreSQL</option>
                    <option value="SQLSERVER">🔷 SQL Server</option>
                    <option value="MYSQL">🐬 MySQL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-5">
                <div className="col-span-2">
                  <ValidatedInput
                    label="Host"
                    type="text"
                    value={formData.host}
                    onChange={(e) => {
                      setFormData({ ...formData, host: e.target.value })
                      setErrors({ ...errors, host: '' })
                    }}
                    validate={validateHost}
                    error={errors.host}
                    placeholder="localhost ou IP do servidor"
                    required
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
                />
                <ValidatedInput
                  label="Database"
                  type="text"
                  value={formData.database}
                  onChange={(e) => {
                    setFormData({ ...formData, database: e.target.value })
                    setErrors({ ...errors, database: '' })
                  }}
                  validate={validateDatabase}
                  error={errors.database}
                  placeholder="Nome do banco"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <ValidatedInput
                  label="Usuário"
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => {
                    setFormData({ ...formData, usuario: e.target.value })
                    setErrors({ ...errors, usuario: '' })
                  }}
                  validate={validateUsuario}
                  error={errors.usuario}
                  placeholder="Usuário do banco"
                  required
                />
                <ValidatedInput
                  label={`Senha ${editingId ? '(deixe em branco para manter)' : ''}`}
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
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestarFormulario}
                  disabled={testando}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Testar Conexão
                    </>
                  )}
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Conexões */}
        {conexoes.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Nenhuma conexão cadastrada</h3>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                Comece adicionando sua primeira conexão de banco de dados para criar relatórios
              </p>
              <button
                onClick={handleNovaConexao}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Nova Conexão
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {conexoes.map((conexao) => {
              const badge = getTipoBadge(conexao.tipo)
              return (
                <div
                  key={conexao.id}
                  className="bg-slate-800/50 border border-slate-700/50 hover:border-primary-500/30 p-5 rounded-xl flex justify-between items-center transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Ícone de status */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${conexao.ultimo_teste_ok === true
                        ? 'bg-green-500/20'
                        : conexao.ultimo_teste_ok === false
                          ? 'bg-red-500/20'
                          : 'bg-slate-700/50'
                      }`}>
                      {conexao.ultimo_teste_ok === true && <Check className="w-5 h-5 text-green-400" />}
                      {conexao.ultimo_teste_ok === false && <X className="w-5 h-5 text-red-400" />}
                      {conexao.ultimo_teste_ok === null && <AlertCircle className="w-5 h-5 text-slate-400" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-semibold text-lg">{conexao.nome}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${badge.color}`}>
                          {badge.icon} {conexao.tipo}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-1.5 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Server className="w-3 h-3" />
                          {conexao.host}:{conexao.porta}
                        </span>
                        <span className="flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          {conexao.database}
                        </span>
                        <span>
                          👤 {conexao.usuario}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="mx-4">
                    {conexao.ultimo_teste_ok === true && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        ✓ Conectado
                      </span>
                    )}
                    {conexao.ultimo_teste_ok === false && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                        ✗ Erro
                      </span>
                    )}
                    {conexao.ultimo_teste_ok === null && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400 border border-slate-500/30">
                        Não testado
                      </span>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => testarConexao(conexao.id)}
                      disabled={testandoId === conexao.id}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                      title="Testar conexão"
                    >
                      {testandoId === conexao.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Testando...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Testar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEditarConexao(conexao)}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                      title="Editar conexão"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => deletarConexao(conexao.id, conexao.nome)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors text-sm"
                      title="Deletar conexão"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {ConfirmComponent}
    </AppLayout>
  )
}
