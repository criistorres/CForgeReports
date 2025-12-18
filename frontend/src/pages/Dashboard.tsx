import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Grid, List, Download, SortAsc, Trash2, Copy, FolderInput } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { FolderTree, ReportListItem, Breadcrumb, PastaModal } from '@/components/features'
import { MoverRelatoriosModal, useMoverRelatoriosModal } from '@/components/features/MoverRelatoriosModal'
import type { PastaNode, ViewType } from '@/components/features/FolderTree'
import type { Relatorio } from '@/components/features/ReportListItem'
import api from '@/services/api'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'

interface Execucao {
  id: string
  relatorio_id: string
  relatorio_nome: string
  relatorio_descricao?: string
  iniciado_em: string
}

type LayoutType = 'list' | 'grid'
type SortType = 'nome' | 'data' | 'execucoes'
type SortOrder = 'asc' | 'desc'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Estados principais
  const [pastas, setPastas] = useState<PastaNode[]>([])
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [recentes, setRecentes] = useState<Execucao[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRelatorios, setLoadingRelatorios] = useState(false)
  const [busca, setBusca] = useState('')
  const buscaDebounced = useDebounce(busca, 300)

  // Navegação e visualização
  const [viewAtual, setViewAtual] = useState<ViewType>('todos')
  const [pastaSelecionada, setPastaSelecionada] = useState<string | null>(null)
  const [layoutType, setLayoutType] = useState<LayoutType>('list')
  const [sortBy, setSortBy] = useState<SortType>('nome')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Seleção múltipla
  const [relatoriosSelecionados, setRelatoriosSelecionados] = useState<Set<string>>(new Set())
  const [modoSelecao, setModoSelecao] = useState(false)

  // Gerenciamento de pastas
  const [modalPastaAberto, setModalPastaAberto] = useState(false)
  const [pastaEditando, setPastaEditando] = useState<PastaNode | null>(null)
  const [pastaPaiNova, setPastaPaiNova] = useState<string | null>(null)

  // Modal mover relatórios
  const modalMover = useMoverRelatoriosModal()

  // Filtros avançados
  const [filtroData, setFiltroData] = useState<'hoje' | 'semana' | 'mes' | 'todos'>('todos')

  // Refs
  const listaRef = useRef<HTMLDivElement>(null)

  // Carrega dados iniciais
  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [pastasRes, relatoriosRes, favoritosRes, recentesRes] = await Promise.all([
        api.get('/pastas/'),
        api.get('/relatorios/'),
        api.get('/favoritos/'),
        api.get('/historico/?limit=50')
      ])

      const pastasFlat = pastasRes.data as PastaNode[]
      const pastasComSubpastas = organizarPastasEmArvore(pastasFlat)
      setPastas(pastasComSubpastas)

      setRelatorios(relatoriosRes.data)

      const favIds = new Set(favoritosRes.data.map((f: any) => f.relatorio_id))
      setFavoritos(favIds)

      setRecentes(recentesRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      showToast('Erro ao carregar dados do dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Organiza pastas em estrutura de árvore
  const organizarPastasEmArvore = useCallback((pastasFlat: PastaNode[]): PastaNode[] => {
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
  }, [])

  // Carrega relatórios por pasta
  useEffect(() => {
    const carregarRelatoriosPorPasta = async () => {
      if (viewAtual === 'pasta' && pastaSelecionada) {
        setLoadingRelatorios(true)
        try {
          const res = await api.get(`/relatorios/?pasta_id=${pastaSelecionada}`)
          setRelatorios(res.data)
        } catch (error) {
          console.error('Erro ao carregar relatórios:', error)
        } finally {
          setLoadingRelatorios(false)
        }
      } else if (viewAtual === 'todos') {
        setLoadingRelatorios(true)
        try {
          const res = await api.get('/relatorios/')
          setRelatorios(res.data)
        } catch (error) {
          console.error('Erro ao carregar relatórios:', error)
        } finally {
          setLoadingRelatorios(false)
        }
      }
    }

    carregarRelatoriosPorPasta()
  }, [pastaSelecionada, viewAtual])

  // Handlers de navegação
  const handleSelectPasta = useCallback((pastaId: string | null) => {
    setPastaSelecionada(pastaId)
    setViewAtual(pastaId ? 'pasta' : 'todos')
    setModoSelecao(false)
    setRelatoriosSelecionados(new Set())
  }, [])

  const handleSelectFavoritos = useCallback(() => {
    setViewAtual('favoritos')
    setPastaSelecionada(null)
    setModoSelecao(false)
    setRelatoriosSelecionados(new Set())
  }, [])

  const handleSelectRecentes = useCallback(() => {
    setViewAtual('recentes')
    setPastaSelecionada(null)
    setModoSelecao(false)
    setRelatoriosSelecionados(new Set())
  }, [])

  const handleToggleFavorito = async (relatorioId: string, novoEstado: boolean) => {
    try {
      if (novoEstado) {
        await api.post('/favoritos/', { relatorio_id: relatorioId })
        setFavoritos(prev => new Set([...prev, relatorioId]))
        showToast('Adicionado aos favoritos', 'success')
      } else {
        await api.delete(`/favoritos/${relatorioId}/`)
        setFavoritos(prev => {
          const newSet = new Set(prev)
          newSet.delete(relatorioId)
          return newSet
        })
        showToast('Removido dos favoritos', 'success')
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error)
      showToast('Erro ao atualizar favorito', 'error')
    }
  }

  // Handlers de gerenciamento de pastas
  const handleCriarPasta = useCallback((pastaPai?: string | null) => {
    setPastaEditando(null)
    setPastaPaiNova(pastaPai || null)
    setModalPastaAberto(true)
  }, [])

  const handleEditarPasta = useCallback((pasta: PastaNode) => {
    setPastaEditando(pasta)
    setPastaPaiNova(null)
    setModalPastaAberto(true)
  }, [])

  const handleExcluirPasta = async (pasta: PastaNode) => {
    if (!confirm(`Tem certeza que deseja excluir a pasta "${pasta.nome}"?`)) {
      return
    }

    try {
      await api.delete(`/pastas/${pasta.id}/`)
      const pastasRes = await api.get('/pastas/')
      const pastasFlat = pastasRes.data as PastaNode[]
      const pastasComSubpastas = organizarPastasEmArvore(pastasFlat)
      setPastas(pastasComSubpastas)

      if (pastaSelecionada === pasta.id) {
        handleSelectPasta(null)
      }

      showToast('Pasta excluída com sucesso', 'success')
    } catch (error) {
      console.error('Erro ao excluir pasta:', error)
      showToast('Erro ao excluir pasta. Verifique se ela não possui relatórios.', 'error')
    }
  }

  const handleSucessoPasta = async () => {
    const pastasRes = await api.get('/pastas/')
    const pastasFlat = pastasRes.data as PastaNode[]
    const pastasComSubpastas = organizarPastasEmArvore(pastasFlat)
    setPastas(pastasComSubpastas)
  }

  // Seleção múltipla
  const handleToggleSelecao = (relatorioId: string) => {
    setRelatoriosSelecionados(prev => {
      const newSet = new Set(prev)
      if (newSet.has(relatorioId)) {
        newSet.delete(relatorioId)
      } else {
        newSet.add(relatorioId)
      }
      return newSet
    })
  }

  const handleSelecionarTodos = () => {
    if (relatoriosSelecionados.size === relatoriosFiltrados.length) {
      setRelatoriosSelecionados(new Set())
    } else {
      setRelatoriosSelecionados(new Set(relatoriosFiltrados.map(r => r.id)))
    }
  }

  const handleExcluirSelecionados = async () => {
    if (relatoriosSelecionados.size === 0) return

    if (!confirm(`Excluir ${relatoriosSelecionados.size} relatório(s)?`)) return

    try {
      await Promise.all(
        Array.from(relatoriosSelecionados).map(id =>
          api.delete(`/relatorios/${id}/`)
        )
      )

      setRelatorios(prev => prev.filter(r => !relatoriosSelecionados.has(r.id)))
      setRelatoriosSelecionados(new Set())
      setModoSelecao(false)
      showToast('Relatórios excluídos com sucesso', 'success')
    } catch (error) {
      console.error('Erro ao excluir relatórios:', error)
      showToast('Erro ao excluir alguns relatórios', 'error')
    }
  }

  const handleMoverSelecionados = async (pastaDestinoId: string | null) => {
    if (relatoriosSelecionados.size === 0) return

    try {
      await Promise.all(
        Array.from(relatoriosSelecionados).map(id =>
          api.patch(`/relatorios/${id}/`, { pasta_id: pastaDestinoId })
        )
      )

      // Recarrega relatórios
      const res = await api.get('/relatorios/')
      setRelatorios(res.data)
      setRelatoriosSelecionados(new Set())
      setModoSelecao(false)
      showToast('Relatórios movidos com sucesso', 'success')
    } catch (error) {
      console.error('Erro ao mover relatórios:', error)
      showToast('Erro ao mover alguns relatórios', 'error')
    }
  }

  // Filtragem e ordenação
  const relatoriosFiltrados = useMemo(() => {
    let lista: Relatorio[] = []

    // Seleciona lista base
    if (viewAtual === 'favoritos') {
      lista = relatorios.filter(r => favoritos.has(r.id))
    } else if (viewAtual === 'recentes') {
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
    if (buscaDebounced) {
      const termoBusca = buscaDebounced.toLowerCase()
      lista = lista.filter(r =>
        r.nome.toLowerCase().includes(termoBusca) ||
        r.descricao?.toLowerCase().includes(termoBusca)
      )
    }

    // Aplica filtro de data
    if (filtroData !== 'todos' && viewAtual === 'recentes') {
      const agora = new Date()
      let dataLimite = new Date()

      switch (filtroData) {
        case 'hoje':
          dataLimite.setHours(0, 0, 0, 0)
          break
        case 'semana':
          dataLimite.setDate(agora.getDate() - 7)
          break
        case 'mes':
          dataLimite.setMonth(agora.getMonth() - 1)
          break
      }

      lista = lista.filter(r => {
        if (!r.ultima_execucao) return false
        return new Date(r.ultima_execucao) >= dataLimite
      })
    }

    // Ordena
    lista.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'nome':
          comparison = a.nome.localeCompare(b.nome)
          break
        case 'data':
          comparison = new Date(a.criado_em || 0).getTime() - new Date(b.criado_em || 0).getTime()
          break
        case 'execucoes':
          comparison = (a.ultima_execucao ? 1 : 0) - (b.ultima_execucao ? 1 : 0)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return lista
  }, [relatorios, favoritos, recentes, viewAtual, buscaDebounced, sortBy, sortOrder, filtroData])

  // Breadcrumb
  const breadcrumbItems = useMemo(() => {
    if (!pastaSelecionada) return []

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

  // Estatísticas
  const estatisticas = useMemo(() => {
    return {
      total: relatorios.length,
      favoritos: favoritos.size,
      recentes: recentes.length,
      executados: relatorios.filter(r => r.ultima_execucao).length
    }
  }, [relatorios, favoritos, recentes])

  // Exportar dados
  const handleExportar = () => {
    if (relatoriosFiltrados.length === 0) {
      showToast('Nenhum relatório para exportar', 'warning')
      return
    }

    const dados = relatoriosFiltrados.map(r => ({
      Nome: r.nome,
      Descrição: r.descricao || '',
      'Criado em': r.criado_em,
      'Última execução': r.ultima_execucao || 'Nunca',
      Favorito: favoritos.has(r.id) ? 'Sim' : 'Não'
    }))

    const csv = [
      Object.keys(dados[0]).join(','),
      ...dados.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorios_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    showToast('Relatórios exportados com sucesso', 'success')
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400">Carregando dashboard...</p>
          </div>
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
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                {viewAtual === 'pasta' && breadcrumbItems.length > 0 && (
                  <Breadcrumb items={breadcrumbItems} onNavigate={handleSelectPasta} />
                )}
                <h1 className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
                  {tituloSecao}
                  <span className="text-sm font-normal text-slate-400">
                    ({relatoriosFiltrados.length})
                  </span>
                </h1>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2">
                {modoSelecao && relatoriosSelecionados.size > 0 && (
                  <>
                    <button
                      onClick={handleExcluirSelecionados}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir ({relatoriosSelecionados.size})
                    </button>
                    <button
                      onClick={modalMover.abrir}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm"
                    >
                      <FolderInput className="w-4 h-4" />
                      Mover
                    </button>
                  </>
                )}

                <button
                  onClick={() => setModoSelecao(!modoSelecao)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${modoSelecao
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                >
                  <Copy className="w-4 h-4" />
                  {modoSelecao ? 'Cancelar' : 'Selecionar'}
                </button>

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
            </div>

            {/* Estatísticas rápidas */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-2xl font-bold text-white">{estatisticas.total}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-slate-400">Favoritos</p>
                <p className="text-2xl font-bold text-yellow-400">{estatisticas.favoritos}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-slate-400">Executados</p>
                <p className="text-2xl font-bold text-green-400">{estatisticas.executados}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-slate-400">Recentes</p>
                <p className="text-2xl font-bold text-blue-400">{estatisticas.recentes}</p>
              </div>
            </div>

            {/* Barra de ferramentas */}
            <div className="flex items-center gap-3">
              {/* Busca */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar relatórios..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Filtros */}
              {viewAtual === 'recentes' && (
                <select
                  value={filtroData}
                  onChange={(e) => setFiltroData(e.target.value as any)}
                  className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors"
                >
                  <option value="todos">Todos</option>
                  <option value="hoje">Hoje</option>
                  <option value="semana">Última semana</option>
                  <option value="mes">Último mês</option>
                </select>
              )}

              {/* Ordenação */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors"
              >
                <option value="nome">Nome</option>
                <option value="data">Data de criação</option>
                <option value="execucoes">Execuções</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
                title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
              >
                <SortAsc className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </button>

              {/* Layout toggle */}
              <div className="flex bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setLayoutType('list')}
                  className={`p-2 transition-colors ${layoutType === 'list' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutType('grid')}
                  className={`p-2 transition-colors ${layoutType === 'grid' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              {/* Exportar */}
              <button
                onClick={handleExportar}
                className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
                title="Exportar CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de Relatórios */}
          <div className="flex-1 overflow-y-auto p-6" ref={listaRef}>
            {loadingRelatorios ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : relatoriosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <p className="text-lg mb-2">
                  {busca ? 'Nenhum relatório encontrado' : 'Nenhum relatório nesta pasta'}
                </p>
                {viewAtual === 'favoritos' && !busca && (
                  <p className="text-sm">Clique na ⭐ para adicionar relatórios aos favoritos</p>
                )}
              </div>
            ) : (
              <>
                {modoSelecao && (
                  <div className="mb-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={relatoriosSelecionados.size === relatoriosFiltrados.length}
                      onChange={handleSelecionarTodos}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-slate-400">
                      Selecionar todos ({relatoriosFiltrados.length})
                    </span>
                  </div>
                )}

                <div className={layoutType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
                  {relatoriosFiltrados.map(relatorio => (
                    <ReportListItem
                      key={relatorio.id}
                      relatorio={relatorio}
                      isFavorito={favoritos.has(relatorio.id)}
                      onToggleFavorito={handleToggleFavorito}
                      isSelected={modoSelecao && relatoriosSelecionados.has(relatorio.id)}
                      onToggleSelect={modoSelecao ? () => handleToggleSelecao(relatorio.id) : undefined}
                      layoutType={layoutType}
                    />
                  ))}
                </div>
              </>
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

      {/* Modal Mover Relatórios */}
      <MoverRelatoriosModal
        isOpen={modalMover.isOpen}
        onClose={modalMover.fechar}
        onConfirm={handleMoverSelecionados}
        pastas={pastas}
        pastaSelecionada={pastaSelecionada}
        quantidadeRelatorios={relatoriosSelecionados.size}
      />
    </AppLayout>
  )
}
