import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { FavoritoButton } from '@/components/features/FavoritoButton'

interface Relatorio {
  id: string
  nome: string
  descricao: string
  conexao_nome: string
  criado_em: string
}

export default function Relatorios() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busca, setBusca] = useState('')
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadRelatorios()
    loadFavoritos()
  }, [])

  useEffect(() => {
    loadRelatorios()
  }, [busca])

  async function loadRelatorios() {
    try {
      setLoading(true)
      const params = busca ? `?busca=${encodeURIComponent(busca)}` : ''
      const response = await api.get(`/relatorios/${params}`)
      setRelatorios(response.data)
      setError('')
    } catch (err) {
      setError('Erro ao carregar relatórios')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadFavoritos() {
    try {
      const response = await api.get('/favoritos/')
      const favIds = new Set(response.data.map((f: any) => f.relatorio_id))
      setFavoritos(favIds)
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err)
    }
  }

  function handleFavoritoToggle(relatorioId: string, isFavorito: boolean) {
    setFavoritos(prev => {
      const newSet = new Set(prev)
      if (isFavorito) {
        newSet.add(relatorioId)
      } else {
        newSet.delete(relatorioId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white">Carregando relatórios...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <Link
          to="/relatorios/novo"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
        >
          Novo Relatório
        </Link>
      </div>

      {/* Campo de Busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar relatórios por nome ou descrição..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {relatorios.length === 0 ? (
        <div className="bg-slate-800 p-8 rounded-lg text-center">
          <p className="text-slate-400 mb-4">Nenhum relatório cadastrado</p>
          <Link
            to="/relatorios/novo"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
          >
            Criar Primeiro Relatório
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {relatorios.map(rel => (
            <div key={rel.id} className="bg-slate-800 p-4 rounded-lg flex justify-between items-start">
              <div className="flex items-start gap-3 flex-1">
                <FavoritoButton
                  relatorioId={rel.id}
                  isFavorito={favoritos.has(rel.id)}
                  onToggle={(isFav) => handleFavoritoToggle(rel.id, isFav)}
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">{rel.nome}</h3>
                  {rel.descricao && (
                    <p className="text-slate-400 text-sm mt-1">{rel.descricao}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>Conexão: {rel.conexao_nome}</span>
                    <span>Criado em: {new Date(rel.criado_em).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/relatorios/${rel.id}/executar`}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                >
                  Executar
                </Link>
                <Link
                  to={`/relatorios/${rel.id}/editar`}
                  className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded transition"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
