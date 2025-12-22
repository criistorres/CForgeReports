import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Grid, List, Download, SortAsc, Trash2, Copy, FolderInput, FileText } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { FolderTree, ReportListItem, Breadcrumb, PastaModal, AdicionarRelatoriosModal, GerenciarPermissoesModal } from '@/components/features'
import { RelatorioExecutor } from '@/components/features/RelatorioExecutor'
import { MoverRelatoriosModal, useMoverRelatoriosModal } from '@/components/features/MoverRelatoriosModal'
import type { PastaNode, ViewType, RelatorioNode } from '@/components/features/FolderTree'
import type { Relatorio } from '@/components/features/ReportListItem'
import api from '@/services/api'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/hooks/useConfirm'
import { EmptyState } from '@/components/ui/empty-state'
import { getErrorMessage } from '@/utils/errorMessages'

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
  const { confirm, ConfirmComponent } = useConfirm()

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
  const [modalAdicionarRelatorioAberto, setModalAdicionarRelatorioAberto] = useState(false)
  const [pastaAlvoAdicionar, setPastaAlvoAdicionar] = useState<PastaNode | null>(null)

  // Gerenciamento de permissões
  const [modalPermissoesAberto, setModalPermissoesAberto] = useState(false)
  const [relatorioAlvoPermissoes, setRelatorioAlvoPermissoes] = useState<RelatorioNode | null>(null)

  // Modal mover relatórios
  const modalMover = useMoverRelatoriosModal()

  // Filtros avançados
  const [filtroData] = useState<'hoje' | 'semana' | 'mes' | 'todos'>('todos')

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
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      const mensagem = getErrorMessage(error)
      showToast(mensagem, 'error')
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
        } catch (error: any) {
          console.error('Erro ao carregar relatórios:', error)
          const mensagem = getErrorMessage(error)
          showToast(mensagem, 'error')
        } finally {
          setLoadingRelatorios(false)
        }
      } else if (viewAtual === 'todos' && !relatorioSelecionado) {
        setLoadingRelatorios(true)
        try {
          const res = await api.get('/relatorios/')
          setRelatorios(res.data)
        } catch (error: any) {
          console.error('Erro ao carregar relatórios:', error)
          const mensagem = getErrorMessage(error)
          showToast(mensagem, 'error')
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
    } catch (error: any) {
      console.error('Erro ao atualizar favorito:', error)
      const mensagem = getErrorMessage(error)
      showToast(mensagem, 'error')
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
    if (pasta.qtd_relatorios > 0 || pasta.qtd_subpastas > 0) {
      showToast('Não é possível excluir pasta com relatórios ou subpastas. Mova ou exclua o conteúdo primeiro.', 'error')
      return
    }

    const confirmed = await confirm({
      title: 'Excluir Pasta',
      description: `Tem certeza que deseja excluir a pasta "${pasta.nome}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'destructive'
    })

    if (!confirmed) return

    try {
      await api.delete(`/pastas/${pasta.id}/`)
      const res = await api.get('/pastas/')
      const pastasFlat = res.data as PastaNode[]
      const pastasComRelatorios = organizarPastasComRelatorios(pastasFlat, relatorios)
      setPastas(pastasComRelatorios)
      showToast('Pasta excluída com sucesso', 'success')
    } catch (error: any) {
      console.error('Erro ao excluir pasta:', error)
      const mensagem = getErrorMessage(error)
      showToast(mensagem, 'error')
    }
  }

  const handleRemoverRelatorio = async (relatorio: RelatorioNode) => {
    const confirmed = await confirm({
      title: 'Remover da Pasta',
      description: `Deseja remover o relatório "${relatorio.nome}" desta pasta? Ele voltará para o nível principal.`,
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      variant: 'default'
    })

    if (!confirmed) return

    try {
      await api.patch(`/relatorios/${relatorio.id}/`, { pasta: null })

      // Atualiza lista de relatórios localmente
      setRelatorios(prev => prev.map(r =>
        r.id === relatorio.id ? { ...r, pasta: null, pasta_id: null } : r
      ))

      // Atualiza árvore de pastas
      const resRel = await api.get('/relatorios/')
      const pastasRes = await api.get('/pastas/')
      const pastasFlat = pastasRes.data as PastaNode[]
      const pastasComRelatorios = organizarPastasComRelatorios(pastasFlat, resRel.data)
      setPastas(pastasComRelatorios)

      showToast('Relatório removido da pasta', 'success')
    } catch (error: any) {
      console.error('Erro ao remover relatório da pasta:', error)
      const mensagem = getErrorMessage(error)
      showToast(mensagem, 'error')
    }
  }

  const handleSucessoPasta = async () => {
    const pastasRes = await api.get('/pastas/')
    const pastasFlat = pastasRes.data as PastaNode[]
    const pastasComRelatorios = organizarPastasComRelatorios(pastasFlat, relatorios)
    setPastas(pastasComRelatorios)
  }

  const handleAbrirAdicionarRelatorio = (pasta: PastaNode) => {
    setPastaAlvoAdicionar(pasta)
    setModalAdicionarRelatorioAberto(true)
  }

  const handleSucessoAdicionarRelatorio = async () => {
    // Recarrega relatórios
    const resRel = await api.get('/relatorios/')
    setRelatorios(resRel.data)

    // Atualiza árvore de pastas
    const pastasRes = await api.get('/pastas/')
    const pastasFlat = pastasRes.data as PastaNode[]
    const pastasComRelatorios = organizarPastasComRelatorios(pastasFlat, resRel.data)
    setPastas(pastasComRelatorios)
  }

  const handleGerenciarPermissoes = (relatorio: RelatorioNode) => {
    setRelatorioAlvoPermissoes(relatorio)
    setModalPermissoesAberto(true)
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

    const quantidade = relatoriosSelecionados.size
    const confirmed = await confirm({
      title: 'Excluir Relatórios',
      description: `Tem certeza que deseja excluir ${quantidade} relatório${quantidade > 1 ? 's' : ''}? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'destructive'
    })

    if (!confirmed) return

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
    } catch (error: any) {
      console.error('Erro ao excluir relatórios:', error)
      const mensagem = getErrorMessage(error)
      showToast(mensagem, 'error')
    }
  }

  const handleMoverSelecionados = async (pastaDestinoId: string | null) => {
    if (relatoriosSelecionados.size === 0) return

    try {
      await Promise.all(
        Array.from(relatoriosSelecionados).map(id =>
          api.patch(`/relatorios/${id}/`, { pasta: pastaDestinoId })
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
    } catch (error: any) {
      console.error('Erro ao mover relatórios:', error)
      const mensagem = getErrorMessage(error)
      showToast(mensagem, 'error')
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
    <AppLayout
      sidebar={
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
          onAdicionarRelatorio={handleAbrirAdicionarRelatorio}
          onRemoverRelatorio={handleRemoverRelatorio}
          onGerenciarPermissoes={handleGerenciarPermissoes}
          isAdmin={user?.role === 'ADMIN' || user?.role === 'TECNICO'}
        />
      }
    >
      <div className="h-full flex flex-col min-w-0">
        {/* Se um relatório está selecionado, mostra o executor */}
        {viewAtual === 'relatorio' && relatorioSelecionado ? (
          <RelatorioExecutor
            relatorioId={relatorioSelecionado}
            onClose={handleFecharRelatorio}
          />
        ) : (
          <div className="flex flex-col h-full">
            {/* Header section with glass effect */}
            <div className="pb-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="flex-1">
                  {viewAtual === 'pasta' && breadcrumbItems.length > 0 && (
                    <div className="mb-3 px-1">
                      <Breadcrumb items={breadcrumbItems} onNavigate={handleSelectPasta} />
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                      {tituloSecao}
                      <span className="text-xl font-medium text-slate-500 bg-white/5 px-3 py-1 rounded-2xl border border-white/5">
                        {relatoriosFiltrados.length}
                      </span>
                    </h1>
                  </div>
                  <p className="text-slate-400 mt-2 max-w-2xl font-medium">
                    {viewAtual === 'todos' ? 'Gerencie e execute todos os seus relatórios em um só lugar.' :
                      viewAtual === 'favoritos' ? 'Seus relatórios mais importantes marcados com estrela.' :
                        'Explore o conteúdo desta pasta e execute seus relatórios.'}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-3">
                  {/* Botão de criar novo relatório */}
                  <button
                    onClick={() => navigate('/relatorios/novo')}
                    className="group flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                      <Plus className="w-5 h-5" />
                    </div>
                    Novo Relatório
                  </button>

                  {/* Modo seleção */}
                  {!modoSelecao ? (
                    <button
                      onClick={() => setModoSelecao(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all border border-white/10"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                      Selecionar
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                      <button
                        onClick={() => {
                          setModoSelecao(false)
                          setRelatoriosSelecionados(new Set())
                        }}
                        className="px-4 py-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all text-sm font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => modalMover.abrir()}
                        disabled={relatoriosSelecionados.size === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all text-sm font-bold"
                      >
                        <FolderInput className="w-4 h-4" />
                        Mover ({relatoriosSelecionados.size})
                      </button>
                      <button
                        onClick={handleExcluirSelecionados}
                        disabled={relatoriosSelecionados.size === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all text-sm font-bold"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Toolbar Area */}
              <div className="flex flex-col lg:flex-row items-center gap-4 bg-white/5 p-3 rounded-[2rem] border border-white/10 backdrop-blur-md">
                {/* Busca */}
                <div className="flex-1 relative group w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Pesquisar relatórios..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-slate-500 focus:outline-none transition-all font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto">
                  {/* Ordenação */}
                  <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-3 border border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter ml-1">Ordenar por:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortType)}
                      className="bg-transparent py-2.5 text-sm font-semibold text-slate-300 focus:outline-none appearance-none cursor-pointer pr-2"
                    >
                      <option value="nome">Nome</option>
                      <option value="data">Data</option>
                      <option value="execucoes">Execuções</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-slate-400 hover:text-purple-400"
                    >
                      <SortAsc className={`w-4 h-4 transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Layout Toggle */}
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
                    <button
                      onClick={() => setLayoutType('list')}
                      className={`p-2 rounded-xl transition-all ${layoutType === 'list' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setLayoutType('grid')}
                      className={`p-2 rounded-xl transition-all ${layoutType === 'grid' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={handleExportar}
                    className="p-3 bg-white/5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 rounded-2xl transition-all border border-white/5"
                    title="Exportar CSV"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de relatórios */}
            <div ref={listaRef} className="flex-1 overflow-y-auto">
              {loadingRelatorios ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : relatoriosFiltrados.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title={busca ? 'Nenhum relatório encontrado' : 'Nenhum relatório aqui'}
                  description={
                    busca
                      ? `Não encontramos relatórios que correspondam a "${busca}". Tente buscar com outros termos.`
                      : viewAtual === 'favoritos'
                        ? 'Você ainda não tem relatórios favoritos. Clique na estrela ⭐ para adicionar relatórios aos favoritos.'
                        : viewAtual === 'recentes'
                          ? 'Você ainda não executou nenhum relatório. Execute um relatório para vê-lo aqui.'
                          : 'Esta pasta está vazia. Crie um novo relatório ou mova relatórios existentes para cá.'
                  }
                  action={
                    viewAtual !== 'favoritos' && viewAtual !== 'recentes'
                      ? {
                        label: 'Criar Novo Relatório',
                        onClick: () => navigate('/relatorios/novo')
                      }
                      : undefined
                  }
                />
              ) : (
                <div className="px-1">
                  {modoSelecao && (
                    <div className="mb-4 flex items-center gap-2 px-6">
                      <input
                        type="checkbox"
                        checked={relatoriosSelecionados.size === relatoriosFiltrados.length}
                        onChange={handleSelecionarTodos}
                        className="w-4 h-4 rounded-md border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500/50"
                      />
                      <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">
                        Selecionar todos ({relatoriosFiltrados.length})
                      </span>
                    </div>
                  )}

                  <div className={layoutType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6' : 'space-y-3 p-6'}>
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
                </div>
              )}
            </div>
          </div>
        )}
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

      {/* Modal Adicionar Relatórios */}
      {pastaAlvoAdicionar && (
        <AdicionarRelatoriosModal
          isOpen={modalAdicionarRelatorioAberto}
          onClose={() => setModalAdicionarRelatorioAberto(false)}
          onConfirm={handleSucessoAdicionarRelatorio}
          pastaDestinoId={pastaAlvoAdicionar.id}
          pastaNome={pastaAlvoAdicionar?.nome || ''}
        />
      )}

      <GerenciarPermissoesModal
        isOpen={modalPermissoesAberto}
        onClose={() => setModalPermissoesAberto(false)}
        relatorioId={relatorioAlvoPermissoes?.id || null}
        relatorioNome={relatorioAlvoPermissoes?.nome || ''}
      />

      {ConfirmComponent}
    </AppLayout>
  )
}
