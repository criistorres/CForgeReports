import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { FolderTree, ReportListItem, Breadcrumb, PastaModal } from '@/components/features'
import type { PastaNode, ViewType } from '@/components/features/FolderTree'
import type { Relatorio } from '@/components/features/ReportListItem'
import api from '@/services/api'

interface Execucao {
  id: string
  relatorio_id: string
  relatorio_nome: string
  relatorio_descricao?: string
  iniciado_em: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Estados
  const [pastas, setPastas] = useState<PastaNode[]>([])
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [recentes, setRecentes] = useState<Execucao[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  // Navegação
  const [viewAtual, setViewAtual] = useState<ViewType>('todos')
  const [pastaSelecionada, setPastaSelecionada] = useState<string | null>(null)

  // Gerenciamento de pastas
  const [modalPastaAberto, setModalPastaAberto] = useState(false)
  const [pastaEditando, setPastaEditando] = useState<PastaNode | null>(null)
  const [pastaPaiNova, setPastaPaiNova] = useState<string | null>(null)

  // Carrega dados iniciais
  useEffect(() => {
    async function carregarDados() {
      try {
        const [pastasRes, relatoriosRes, favoritosRes, recentesRes] = await Promise.all([
          api.get('/pastas/'),
          api.get('/relatorios/'),
          api.get('/favoritos/'),
          api.get('/historico/?limit=20')
        ])

        // Organiza pastas em árvore
        const pastasFlat = pastasRes.data as PastaNode[]
        const pastasComSubpastas = organizarPastasEmArvore(pastasFlat)
        setPastas(pastasComSubpastas)

        setRelatorios(relatoriosRes.data)

        const favIds = new Set(favoritosRes.data.map((f: any) => f.relatorio_id))
        setFavoritos(favIds)

        setRecentes(recentesRes.data)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  // Organiza pastas em estrutura de árvore
  function organizarPastasEmArvore(pastasFlat: PastaNode[]): PastaNode[] {
    const pastaMap = new Map<string, PastaNode>()

    pastasFlat.forEach(pasta => {
      pastaMap.set(pasta.id, { ...pasta, subpastas: [] })
    })

    const pastasRaiz: PastaNode[] = []

    pastasFlat.forEach(pasta => {
      const pastaNode = pastaMap.get(pasta.id)!
      if (pasta.pasta_pai) {
        const pai = pastaMap.get(pasta.pasta_pai)
        if (pai) {
          pai.subpastas = pai.subpastas || []
          pai.subpastas.push(pastaNode)
        }
      } else {
        pastasRaiz.push(pastaNode)
      }
    })

    return pastasRaiz
  }

  // Carrega relatórios por pasta quando muda a seleção
  useEffect(() => {
    if (viewAtual === 'pasta' && pastaSelecionada) {
      api.get(`/relatorios/?pasta_id=${pastaSelecionada}`)
        .then(res => setRelatorios(res.data))
        .catch(console.error)
    } else if (viewAtual === 'todos') {
      api.get('/relatorios/')
        .then(res => setRelatorios(res.data))
        .catch(console.error)
    }
  }, [pastaSelecionada, viewAtual])

  // Handlers de navegação
  const handleSelectPasta = (pastaId: string | null) => {
    setPastaSelecionada(pastaId)
    setViewAtual(pastaId ? 'pasta' : 'todos')
  }

  const handleSelectFavoritos = () => {
    setViewAtual('favoritos')
    setPastaSelecionada(null)
  }

  const handleSelectRecentes = () => {
    setViewAtual('recentes')
    setPastaSelecionada(null)
  }

  const handleToggleFavorito = (relatorioId: string, novoEstado: boolean) => {
    setFavoritos(prev => {
      const newSet = new Set(prev)
      if (novoEstado) {
        newSet.add(relatorioId)
      } else {
        newSet.delete(relatorioId)
      }
      return newSet
    })
  }

  // Handlers de gerenciamento de pastas
  const handleCriarPasta = (pastaPai?: string | null) => {
    setPastaEditando(null)
    setPastaPaiNova(pastaPai || null)
    setModalPastaAberto(true)
  }

  const handleEditarPasta = (pasta: PastaNode) => {
    setPastaEditando(pasta)
    setPastaPaiNova(null)
    setModalPastaAberto(true)
  }

  const handleExcluirPasta = async (pasta: PastaNode) => {
    if (!confirm(`Tem certeza que deseja excluir a pasta "${pasta.nome}"?`)) {
      return
    }

    try {
      await api.delete(`/pastas/${pasta.id}/`)
      // Recarrega pastas após excluir
      const pastasRes = await api.get('/pastas/')
      const pastasFlat = pastasRes.data as PastaNode[]
      const pastasComSubpastas = organizarPastasEmArvore(pastasFlat)
      setPastas(pastasComSubpastas)

      // Se a pasta excluída estava selecionada, deseleciona
      if (pastaSelecionada === pasta.id) {
        handleSelectPasta(null)
      }
    } catch (error) {
      console.error('Erro ao excluir pasta:', error)
      alert('Erro ao excluir pasta. Verifique se ela não possui relatórios.')
    }
  }

  const handleSucessoPasta = async () => {
    // Recarrega pastas após criar/editar
    const pastasRes = await api.get('/pastas/')
    const pastasFlat = pastasRes.data as PastaNode[]
    const pastasComSubpastas = organizarPastasEmArvore(pastasFlat)
    setPastas(pastasComSubpastas)
  }

  // Filtra relatórios baseado na busca e view atual
  const relatoriosFiltrados = useMemo(() => {
    let lista: Relatorio[] = []

    if (viewAtual === 'favoritos') {
      lista = relatorios.filter(r => favoritos.has(r.id))
    } else if (viewAtual === 'recentes') {
      // Converte execuções recentes em formato de relatório
      const recentesUnicos = new Map<string, Relatorio>()
      recentes.forEach(exec => {
        if (!recentesUnicos.has(exec.relatorio_id)) {
          recentesUnicos.set(exec.relatorio_id, {
            id: exec.relatorio_id,
            nome: exec.relatorio_nome,
            descricao: exec.relatorio_descricao || '',
            criado_em: '',
            ultima_execucao: exec.iniciado_em
          })
        }
      })
      lista = Array.from(recentesUnicos.values())
    } else {
      lista = relatorios
    }

    // Aplica busca
    if (busca) {
      const termoBusca = busca.toLowerCase()
      lista = lista.filter(r =>
        r.nome.toLowerCase().includes(termoBusca) ||
        r.descricao?.toLowerCase().includes(termoBusca)
      )
    }

    return lista
  }, [relatorios, favoritos, recentes, viewAtual, busca])

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => {
    if (!pastaSelecionada) return []

    // Encontra o caminho até a pasta selecionada
    function encontrarCaminho(pastaId: string, pastas: PastaNode[], caminho: { id: string; nome: string }[] = []): { id: string; nome: string }[] | null {
      for (const pasta of pastas) {
        if (pasta.id === pastaId) {
          return [...caminho, { id: pasta.id, nome: pasta.nome }]
        }
        if (pasta.subpastas) {
          const resultado = encontrarCaminho(pastaId, pasta.subpastas, [...caminho, { id: pasta.id, nome: pasta.nome }])
          if (resultado) return resultado
        }
      }
      return null
    }

    return encontrarCaminho(pastaSelecionada, pastas) || []
  }, [pastaSelecionada, pastas])

  // Título da seção
  const tituloSecao = useMemo(() => {
    switch (viewAtual) {
      case 'favoritos':
        return '⭐ Favoritos'
      case 'recentes':
        return '🕐 Recentes'
      case 'pasta':
        return breadcrumbItems[breadcrumbItems.length - 1]?.nome || 'Relatórios'
      default:
        return '📊 Todos os Relatórios'
    }
  }, [viewAtual, breadcrumbItems])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">Carregando...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - Árvore de Pastas */}
        <FolderTree
          pastas={pastas}
          pastaSelecionada={pastaSelecionada}
          onSelectPasta={handleSelectPasta}
          onSelectFavoritos={handleSelectFavoritos}
          onSelectRecentes={handleSelectRecentes}
          viewAtual={viewAtual}
          onCriarPasta={handleCriarPasta}
          onEditarPasta={handleEditarPasta}
          onExcluirPasta={handleExcluirPasta}
        />

        {/* Área Principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header com busca e breadcrumb */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                {viewAtual === 'pasta' && <Breadcrumb items={breadcrumbItems} onNavigate={handleSelectPasta} />}
                <h1 className="text-2xl font-bold text-white mt-2">{tituloSecao}</h1>
              </div>

              {/* Botão Novo Relatório (apenas admin/técnico) */}
              {(user?.role === 'ADMIN' || user?.role === 'TECNICO') && (
                <button
                  onClick={() => navigate('/relatorios/novo')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Novo Relatório
                </button>
              )}
            </div>

            {/* Campo de Busca */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar relatórios..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Lista de Relatórios */}
          <div className="flex-1 overflow-y-auto p-6">
            {relatoriosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <p className="text-lg mb-2">
                  {busca ? 'Nenhum relatório encontrado' : 'Nenhum relatório nesta pasta'}
                </p>
                {viewAtual === 'favoritos' && !busca && (
                  <p className="text-sm">Clique na ⭐ para adicionar relatórios aos favoritos</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {relatoriosFiltrados.map(relatorio => (
                  <ReportListItem
                    key={relatorio.id}
                    relatorio={relatorio}
                    isFavorito={favoritos.has(relatorio.id)}
                    onToggleFavorito={handleToggleFavorito}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Pasta */}
      <PastaModal
        isOpen={modalPastaAberto}
        onClose={() => setModalPastaAberto(false)}
        onSuccess={handleSucessoPasta}
        pastaAtual={pastaEditando}
        pastaPai={pastaPaiNova}
      />
    </AppLayout>
  )
}
