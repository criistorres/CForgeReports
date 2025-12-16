import { useState, useEffect } from 'react'
import api from '@/services/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { ForgeCard, ForgeButton, ForgeInput, ForgeLabel, ForgeBadge, ForgeSelect } from '@/components/forge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

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
  const [error, setError] = useState<string | null>(null)
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

  useEffect(() => {
    fetchConexoes()
  }, [])

  async function fetchConexoes() {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/conexoes/')
      setConexoes(response.data)
    } catch (err) {
      setError('Erro ao carregar conexões')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function testarConexao(id: string) {
    try {
      const response = await api.post(`/conexoes/${id}/testar-existente/`)
      if (response.data.sucesso) {
        alert(`✓ ${response.data.mensagem}`)
      } else {
        alert(`✗ ${response.data.mensagem}`)
      }
      fetchConexoes()
    } catch (err: any) {
      const mensagem = err.response?.data?.mensagem || 'Erro ao testar conexão'
      alert(`✗ ${mensagem}`)
    }
  }

  async function deletarConexao(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja deletar a conexão "${nome}"?`)) {
      return
    }

    try {
      await api.delete(`/conexoes/${id}/`)
      alert('Conexão deletada com sucesso')
      fetchConexoes()
    } catch (err) {
      alert('Erro ao deletar conexão')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="loading-bar w-32"></div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="notification error p-4 rounded-lg">
          <p className="text-error">{error}</p>
        </div>
      </AppLayout>
    )
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
      senha: '' // Senha não é retornada pela API
    })
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
        alert(`✓ ${response.data.mensagem}`)
      } else {
        alert(`✗ ${response.data.mensagem}`)
      }
    } catch (err: any) {
      const mensagem = err.response?.data?.mensagem || 'Erro ao testar conexão'
      alert(`✗ ${mensagem}`)
    } finally {
      setTestando(false)
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)

    try {
      if (editingId) {
        await api.put(`/conexoes/${editingId}/`, formData)
        alert('Conexão atualizada com sucesso!')
      } else {
        await api.post('/conexoes/', formData)
        alert('Conexão criada com sucesso!')
      }
      setShowForm(false)
      fetchConexoes()
    } catch (err: any) {
      const mensagem = err.response?.data?.detail || 'Erro ao salvar conexão'
      alert(`Erro: ${mensagem}`)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold gradient-text">Conexões de Banco</h1>
        <ForgeButton onClick={handleNovaConexao} glow>
          + Nova Conexão
        </ForgeButton>
      </div>

      {showForm && (
        <ForgeCard
          title={editingId ? 'Editar Conexão' : 'Nova Conexão'}
          className="mb-6"
        >
          <form onSubmit={handleSalvar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <ForgeLabel htmlFor="nome">Nome *</ForgeLabel>
                <ForgeInput
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div>
                <ForgeLabel htmlFor="tipo">Tipo *</ForgeLabel>
                <ForgeSelect
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  required
                >
                  <option value="POSTGRESQL">PostgreSQL</option>
                  <option value="SQLSERVER">SQL Server</option>
                  <option value="MYSQL">MySQL</option>
                </ForgeSelect>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <ForgeLabel htmlFor="host">Host *</ForgeLabel>
                <ForgeInput
                  id="host"
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  required
                />
              </div>
              <div>
                <ForgeLabel htmlFor="porta">Porta *</ForgeLabel>
                <ForgeInput
                  id="porta"
                  type="number"
                  value={formData.porta}
                  onChange={(e) => setFormData({ ...formData, porta: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <ForgeLabel htmlFor="database">Database *</ForgeLabel>
                <ForgeInput
                  id="database"
                  type="text"
                  value={formData.database}
                  onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                  required
                />
              </div>
              <div>
                <ForgeLabel htmlFor="usuario">Usuário *</ForgeLabel>
                <ForgeInput
                  id="usuario"
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <ForgeLabel htmlFor="senha">
                Senha {editingId ? '(deixe em branco para manter a atual)' : '*'}
              </ForgeLabel>
              <ForgeInput
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                required={!editingId}
              />
            </div>

            <div className="flex gap-3">
              <ForgeButton
                type="button"
                onClick={handleTestarFormulario}
                disabled={testando}
                variant="outline"
              >
                {testando ? 'Testando...' : 'Testar Conexão'}
              </ForgeButton>
              <ForgeButton
                type="submit"
                disabled={salvando}
                glow
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </ForgeButton>
              <ForgeButton
                type="button"
                onClick={() => setShowForm(false)}
                variant="ghost"
              >
                Cancelar
              </ForgeButton>
            </div>
          </form>
        </ForgeCard>
      )}

      {conexoes.length === 0 ? (
        <ForgeCard className="text-center">
          <p className="text-slate-400 text-lg mb-4">Nenhuma conexão cadastrada</p>
          <p className="text-slate-500">Clique em "Nova Conexão" para adicionar sua primeira conexão de banco de dados</p>
        </ForgeCard>
      ) : (
        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Database</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conexoes.map((conexao) => (
                <TableRow key={conexao.id} className="table-row">
                  <TableCell className="font-medium text-white">{conexao.nome}</TableCell>
                  <TableCell>
                    <ForgeBadge variant="inactive">
                      {conexao.tipo}
                    </ForgeBadge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {conexao.host}:{conexao.porta}
                  </TableCell>
                  <TableCell className="text-slate-300">{conexao.database}</TableCell>
                  <TableCell>
                    {conexao.ultimo_teste_ok === true && (
                      <div className="flex items-center gap-2">
                        <span className="status-dot active"></span>
                        <span className="text-success">OK</span>
                      </div>
                    )}
                    {conexao.ultimo_teste_ok === false && (
                      <div className="flex items-center gap-2">
                        <span className="status-dot inactive"></span>
                        <span className="text-error">Erro</span>
                      </div>
                    )}
                    {conexao.ultimo_teste_ok === null && (
                      <div className="flex items-center gap-2">
                        <span className="status-dot inactive"></span>
                        <span className="text-slate-500">Não testado</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-3">
                      <button
                        onClick={() => testarConexao(conexao.id)}
                        className="text-primary-400 hover:text-primary-300 transition"
                        title="Testar conexão"
                      >
                        Testar
                      </button>
                      <button
                        onClick={() => handleEditarConexao(conexao)}
                        className="text-accent-500 hover:text-accent-400 transition"
                        title="Editar conexão"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deletarConexao(conexao.id, conexao.nome)}
                        className="text-error hover:text-red-300 transition"
                        title="Deletar conexão"
                      >
                        Deletar
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppLayout>
  )
}
