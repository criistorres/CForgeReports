import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Grid, List, Download, SortAsc, Trash2, Copy, FolderInput } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { FolderTree, ReportListItem, Breadcrumb, PastaModal } from '@/components/features'
import { RelatorioExecutor } from '@/components/features/RelatorioExecutor'
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
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<string | null>(null)
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
      const relatoriosList = relatoriosRes.data as Relatorio[]

      // Organiza pastas em árvore e adiciona relatórios
      const pastasComRelatorios = organizarPastasComRelatorios(pastasFlat, relatoriosList)
      setPastas(pastasComRelatorios)

      setRelatorios(relatoriosList)

      const favIds = new Set<string>(favoritosRes.data.map((f: any) => f.relatorio_id))
      setFavoritos(favIds)

      setRecentes(recentesRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      showToast('Erro ao carregar dados do dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Organiza pastas em estrutura de árvore e adiciona relatórios a cada pasta
  const organizarPastasComRelatorios = useCallback((pastasFlat: PastaNode[], relatoriosList: Relatorio[]): PastaNode[] => {
    const pastaMap = new Map<string, PastaNode>()

    // Cria mapa de pastas
    pastasFlat.forEach(pasta => {
      pastaMap.set(pasta.id, { ...pasta, subpastas: [], relatorios: [] })
    })

    // Adiciona relatórios às pastas
    relatoriosList.forEach(relatorio => {
      const pastaId = relatorio.pasta || relatorio.pasta_id
      if (pastaId) {
        const pasta = pastaMap.get(pastaId)
        if (pasta) {
          pasta.relatorios = pasta.relatorios || []
          pasta.relatorios.push({
            id: relatorio.id,
            nome: relatorio.nome,
            descricao: relatorio.descricao
          })
        }
      }
    })

    // Monta árvore
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

  // Carrega relatórios por pasta (quando necessário)
  useEffect(() => {
    const carregarRelatoriosPorPasta = async () => {
      if (viewAtual === 'pasta' && pastaSelecionada && !relatorioSelecionado) {
        setLoadingRelatorios(true)
        try {
          const res = await api.get(`/relatorios/?pasta_id=${pastaSelecionada}`)
          setRelatorios(res.data)
        } catch (error) {
          console.error('Erro ao carregar relatórios:', error)
        } finally {
          setLoadingRelatorios(false)
        }
      } else if (viewAtual === 'todos' && !relatorioSelecionado) {
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
  }, [pastaSelecionada, viewAtual, relatorioSelecionado])

  // Handlers de navegação
  const handleSelectPasta = useCallback((pastaId: string | null) => {
    setPastaSelecionada(pastaId)
    setRelatorioSelecionado(null) // Limpa seleção de relatório
    setViewAtual(pastaId ? 'pasta' : 'todos')
  }, [])

  const handleSelectRelatorio = useCallback((relatorioId: string) => {
    setRelatorioSelecionado(relatorioId)
    setViewAtual('relatorio')
  }, [])

  const handleFecharRelatorio = useCallback(() => {
    setRelatorioSelecionado(null)
    setViewAtual(pastaSelecionada ? 'pasta' : 'todos')
  }, [pastaSelecionada])

  const handleSelectFavoritos = useCallback(() => {
    setPastaSelecionada(null)
    setRelatorioSelecionado(null)
    setViewAtual('favoritos')
  }, [])

  const handleSelectRecentes = useCallback(() => {
    setPastaSelecionada(null)
    setRelatorioSelecionado(null)
    setViewAtual('recentes')
  }, [])

  // Favoritos
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

  // Gerenciamento de pastas
  const handleCriarPasta = (pastaPai: string | null = null) => {
    setPastaEditando(null)
    setPastaPaiNova(pastaPai)
    setModalPastaAberto(true)
  }

  const handleEditarPasta = (pasta: PastaNode) => {
    setPastaEditando(pasta)
    setPastaPaiNova(null)
    setModalPastaAberto(true)
  }

  const handleExcluirPasta = async (pasta: PastaNode) => {
    if (!confirm(`Excluir a pasta "${pasta.nome}"?`)) return

    if (pasta.qtd_relatorios > 0 || pasta.qtd_subpastas > 0) {
      showToast('Não é possível excluir pasta com relatórios ou subpastas. Mova ou exclua o conteúdo primeiro.', 'error')
      return
    }

    try {
      await api.delete(`/pastas/${pasta.id}/`)
      const res = await api.get('/pastas/')
      const pastasFlat = res.data as PastaNode[]
      const pastasComRelatorios = organizarPastasComRelatorios(pastasFlat, relatorios)
      setPastas(pastasComRelatorios)
      showToast('Pasta excluída com sucesso', 'success')
    } catch (error: any) {
      console.error('Erro ao excluir pasta:', error)
      showToast(error.response?.data?.erro || 'Erro ao excluir pasta. Verifique se ela não possui relatórios.', 'error')
    }
  }

  const handleSucessoPasta = async () => {
    const pastasRes = await api.get('/pastas/')
    const pastasFlat = pastasRes.data as PastaNode[]
    const pastasComRelatorios = organizarPastasComRelatorios(pastasFlat, relatorios)
    setPastas(pastasComRelatorios)
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

      // Atualiza árvore de pastas
      const pastasRes = await api.get('/pastas/')
      const pastasFlat = pastasRes.data as PastaNode[]
      const pastasComRelatorios = organizarPastasComRelatorios(pastasFlat, res.data)
      setPastas(pastasComRelatorios)
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
            criado_em: exec.iniciado_em,
            ultima_execucao: exec.iniciado_em
          })
        }
      })
      lista = Array.from(recentesUnicos.values())
    } else if (viewAtual === 'pasta' && pastaSelecionada) {
      const pastaId = pastaSelecionada
      lista = relatorios.filter(r => (r.pasta || r.pasta_id) === pastaId)
    } else {
      lista = relatorios
    }

    // Filtro de busca
    if (buscaDebounced) {
      const termo = buscaDebounced.toLowerCase()
      lista = lista.filter(r =>
        r.nome.toLowerCase().includes(termo) ||
        r.descricao?.toLowerCase().includes(termo)
      )
    }

    // Filtro de data
    if (filtroData !== 'todos') {
      const agora = new Date()
      const milisegundos = {
        hoje: 24 * 60 * 60 * 1000,
        semana: 7 * 24 * 60 * 60 * 1000,
        mes: 30 * 24 * 60 * 60 * 1000
      }
      const limite = new Date(agora.getTime() - milisegundos[filtroData])
      lista = lista.filter(r => new Date(r.criado_em) >= limite)
    }

    // Ordenação
    lista.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'nome':
          comparison = a.nome.localeCompare(b.nome)
          break
        case 'data':
          comparison = new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()
          break
        case 'execucoes':
          comparison = (a.ultima_execucao ? 1 : 0) - (b.ultima_execucao ? 1 : 0)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return lista
  }, [relatorios, favoritos, recentes, viewAtual, buscaDebounced, sortBy, sortOrder, filtroData, pastaSelecionada])

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
    if (viewAtual === 'relatorio') return 'Execução de Relatório'

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
        {/* Sidebar - Árvore de Pastas com Relatórios */}
        <FolderTree
          pastas={pastas}
          pastaSelecionada={pastaSelecionada}
          relatorioSelecionado={relatorioSelecionado}
          onSelectPasta={handleSelectPasta}
          onSelectRelatorio={handleSelectRelatorio}
          onSelectFavoritos={handleSelectFavoritos}
          onSelectRecentes={handleSelectRecentes}
          viewAtual={viewAtual}
          onCriarPasta={handleCriarPasta}
          onEditarPasta={handleEditarPasta}
          onExcluirPasta={handleExcluirPasta}
        />

        {/* Área Principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Se um relatório está selecionado, mostra o executor */}
          {viewAtual === 'relatorio' && relatorioSelecionado ? (
            <RelatorioExecutor
              relatorioId={relatorioSelecionado}
              onClose={handleFecharRelatorio}
            />
          ) : (
            <>
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
                  <div className="flex items-center gap-3">
                    {/* Botão de criar novo relatório */}
                    <button
                      onClick={() => navigate('/relatorios/novo')}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Novo Relatório
                    </button>

                    {/* Modo seleção */}
                    {!modoSelecao ? (
                      <button
                        onClick={() => setModoSelecao(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      >
                        <Copy className="w-5 h-5" />
                        Selecionar
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setModoSelecao(false)
                            setRelatoriosSelecionados(new Set())
                          }}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => modalMover.abrir()}
                          disabled={relatoriosSelecionados.size === 0}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                          <FolderInput className="w-5 h-5" />
                          Mover ({relatoriosSelecionados.size})
                        </button>
                        <button
                          onClick={handleExcluirSelecionados}
                          disabled={relatoriosSelecionados.size === 0}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                          Excluir ({relatoriosSelecionados.size})
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Barra de ferramentas */}
                <div className="flex items-center gap-3">
                  {/* Busca */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar relatórios..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>

                  {/* Ordenação */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortType)}
                    className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="nome">Nome</option>
                    <option value="data">Data de criação</option>
                    <option value="execucoes">Últimas execuções</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <SortAsc className={`w-5 h-5 text-white ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Layout */}
                  <div className="flex items-center gap-1 bg-slate-700/50 border border-slate-600 rounded-lg p-1">
                    <button
                      onClick={() => setLayoutType('list')}
                      className={`p-2 rounded ${layoutType === 'list' ? 'bg-primary-600' : 'hover:bg-slate-600'}`}
                    >
                      <List className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => setLayoutType('grid')}
                      className={`p-2 rounded ${layoutType === 'grid' ? 'bg-primary-600' : 'hover:bg-slate-600'}`}
                    >
                      <Grid className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <button
                    onClick={handleExportar}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors text-white"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Lista de relatórios */}
              <div ref={listaRef} className="flex-1 overflow-y-auto p-6">
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
            </>
          )}
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
