import { useState, useEffect } from 'react'
import api from '../services/api'

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Conexões de Banco</h1>
        <button
          onClick={handleNovaConexao}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition cursor-pointer"
        >
          + Nova Conexão
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingId ? 'Editar Conexão' : 'Nova Conexão'}
          </h2>
          <form onSubmit={handleSalvar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                  required
                >
                  <option value="POSTGRESQL">PostgreSQL</option>
                  <option value="SQLSERVER">SQL Server</option>
                  <option value="MYSQL">MySQL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Host *</label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Porta *</label>
                <input
                  type="number"
                  value={formData.porta}
                  onChange={(e) => setFormData({ ...formData, porta: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Database *</label>
                <input
                  type="text"
                  value={formData.database}
                  onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Usuário *</label>
                <input
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Senha {editingId ? '(deixe em branco para manter a atual)' : '*'}
              </label>
              <input
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                required={!editingId}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleTestarFormulario}
                disabled={testando}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
              >
                {testando ? 'Testando...' : 'Testar Conexão'}
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {conexoes.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <p className="text-slate-400 text-lg mb-4">Nenhuma conexão cadastrada</p>
          <p className="text-slate-500">Clique em "Nova Conexão" para adicionar sua primeira conexão de banco de dados</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="text-left p-4 text-slate-300">Nome</th>
                <th className="text-left p-4 text-slate-300">Tipo</th>
                <th className="text-left p-4 text-slate-300">Host</th>
                <th className="text-left p-4 text-slate-300">Database</th>
                <th className="text-left p-4 text-slate-300">Status</th>
                <th className="text-left p-4 text-slate-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {conexoes.map((conexao) => (
                <tr key={conexao.id} className="border-t border-slate-700 hover:bg-slate-750">
                  <td className="p-4 text-white font-medium">{conexao.nome}</td>
                  <td className="p-4 text-slate-300">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-slate-700 text-xs">
                      {conexao.tipo}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    {conexao.host}:{conexao.porta}
                  </td>
                  <td className="p-4 text-slate-300">{conexao.database}</td>
                  <td className="p-4">
                    {conexao.ultimo_teste_ok === true && (
                      <span className="text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        OK
                      </span>
                    )}
                    {conexao.ultimo_teste_ok === false && (
                      <span className="text-red-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                        Erro
                      </span>
                    )}
                    {conexao.ultimo_teste_ok === null && (
                      <span className="text-slate-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                        Não testado
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => testarConexao(conexao.id)}
                        className="text-purple-400 hover:text-purple-300 transition"
                        title="Testar conexão"
                      >
                        Testar
                      </button>
                      <button
                        onClick={() => handleEditarConexao(conexao)}
                        className="text-blue-400 hover:text-blue-300 transition"
                        title="Editar conexão"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deletarConexao(conexao.id, conexao.nome)}
                        className="text-red-400 hover:text-red-300 transition"
                        title="Deletar conexão"
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
