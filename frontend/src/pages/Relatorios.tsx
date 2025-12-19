import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Play, Edit, FileText } from 'lucide-react'
import api from '@/services/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { FavoritoButton } from '@/components/features/FavoritoButton'
import { useToast } from '@/hooks/useToast'
import { EmptyState } from '@/components/ui/empty-state'
import { getErrorMessage } from '@/utils/errorMessages'

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
  const [busca, setBusca] = useState('')
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const { showToast } = useToast()

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
    } catch (err: any) {
      const mensagem = getErrorMessage(err)
      showToast(mensagem, 'error')
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
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400">Carregando relatórios...</p>
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
              <FileText className="w-6 h-6 text-primary-400" />
              Relatórios
            </h1>
            <p className="text-slate-400 mt-1">Gerencie seus relatórios SQL</p>
          </div>
          <Link
            to="/relatorios/novo"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Relatório
          </Link>
        </div>

        {/* Busca */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar relatórios por nome ou descrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-800/50 text-white rounded-lg border border-slate-700 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Lista de Relatórios */}
        {relatorios.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <EmptyState
              icon={FileText}
              title="Nenhum relatório encontrado"
              description={busca 
                ? `Não encontramos relatórios que correspondam a "${busca}". Tente buscar com outros termos.`
                : "Comece criando seu primeiro relatório SQL. Você poderá conectar a bancos de dados e criar consultas personalizadas."
              }
              action={{
                label: 'Criar Primeiro Relatório',
                onClick: () => window.location.href = '/relatorios/novo'
              }}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {relatorios.map(rel => (
              <div
                key={rel.id}
                className="bg-slate-800/50 border border-slate-700/50 hover:border-primary-500/30 p-5 rounded-xl flex justify-between items-start transition-all"
              >
                <div className="flex items-start gap-4 flex-1">
                  <FavoritoButton
                    relatorioId={rel.id}
                    isFavorito={favoritos.has(rel.id)}
                    onToggle={(isFav) => handleFavoritoToggle(rel.id, isFav)}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg">{rel.nome}</h3>
                    {rel.descricao && (
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">{rel.descricao}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span>📊 {rel.conexao_nome}</span>
                      <span>📅 {new Date(rel.criado_em).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    to={`/relatorios/${rel.id}/executar`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Executar
                  </Link>
                  <Link
                    to={`/relatorios/${rel.id}/editar`}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
