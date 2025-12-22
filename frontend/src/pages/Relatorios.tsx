import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Play,
  FileText,
  Calendar,
  Database,
  Star,
  ChevronRight,
  Filter,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import api from '@/services/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/features/DataTable'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/utils/errorMessages'
import type { ColumnDef } from '@tanstack/react-table'

interface Relatorio {
  id: string
  nome: string
  descricao: string
  conexao_nome: string
  criado_em: string
  ativo: boolean
  pode_exportar?: boolean
}

export default function Relatorios() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos')
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    loadRelatorios()
    loadFavoritos()
  }, [])

  async function loadRelatorios() {
    try {
      setLoading(true)
      const response = await api.get('/relatorios/')
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
      const favIds = new Set<string>(response.data.map((f: any) => f.relatorio_id as string))
      setFavoritos(favIds)
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err)
    }
  }

  const handleFavoritoToggle = async (relatorioId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const isFavorito = favoritos.has(relatorioId)
    try {
      if (isFavorito) {
        await api.delete(`/favoritos/${relatorioId}/`)
        setFavoritos(prev => {
          const newSet = new Set(prev)
          newSet.delete(relatorioId)
          return newSet
        })
        showToast('Removido dos favoritos', 'success')
      } else {
        await api.post('/favoritos/', { relatorio_id: relatorioId })
        setFavoritos(prev => {
          const newSet = new Set(prev)
          newSet.add(relatorioId)
          return newSet
        })
        showToast('Adicionado aos favoritos', 'success')
      }
    } catch (error) {
      showToast('Erro ao atualizar favorito', 'error')
    }
  }

  const stats = useMemo(() => {
    return {
      total: relatorios.length,
      ativos: relatorios.filter(r => r.ativo !== false).length,
      favoritos: favoritos.size
    }
  }, [relatorios, favoritos])

  const filteredRelatorios = useMemo(() => {
    return relatorios.filter(rel => {
      const matchesBusca = rel.nome.toLowerCase().includes(busca.toLowerCase()) ||
        rel.descricao?.toLowerCase().includes(busca.toLowerCase())
      const matchesStatus = statusFilter === 'todos' ||
        (statusFilter === 'ativos' && rel.ativo !== false) ||
        (statusFilter === 'inativos' && rel.ativo === false)
      return matchesBusca && matchesStatus
    })
  }, [relatorios, busca, statusFilter])

  const columns: ColumnDef<Relatorio>[] = [
    {
      accessorKey: 'nome',
      header: 'Relatório',
      cell: (info) => (
        <div className="flex items-center gap-4 py-1">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-200 truncate">{info.getValue() as string}</span>
            <span className="text-[11px] text-slate-500 truncate max-w-[300px]">
              {info.row.original.descricao || 'Sem descrição'}
            </span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'conexao_nome',
      header: 'Fonte de Dados',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-300">
            {info.getValue() as string}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'ativo',
      header: 'Status',
      cell: (info) => {
        const ativo = info.getValue() !== false
        return (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${ativo
            ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
            : 'text-slate-400 bg-slate-400/10 border-slate-400/20'}`}>
            <div className={`w-1 h-1 rounded-full ${ativo ? 'bg-emerald-400' : 'bg-slate-400'}`} />
            {ativo ? 'Ativo' : 'Inativo'}
          </div>
        )
      }
    },
    {
      accessorKey: 'criado_em',
      header: 'Data Criação',
      cell: (info) => (
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Calendar className="w-3.5 h-3.5 opacity-50" />
          {new Date(info.getValue() as string).toLocaleDateString('pt-BR')}
        </div>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: (info) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => handleFavoritoToggle(info.row.original.id, e)}
            className={`p-2 rounded-lg transition-all ${favoritos.has(info.row.original.id) ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}
          >
            <Star className={`w-4 h-4 ${favoritos.has(info.row.original.id) ? 'fill-current' : ''}`} />
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/relatorios/${info.row.original.id}/executar`)}
            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 h-8 px-3 text-[11px] font-black uppercase tracking-widest gap-2"
          >
            <Play className="w-3 h-3 fill-current" />
            Executar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/relatorios/${info.row.original.id}/editar`)}
            className="text-slate-400 hover:text-white hover:bg-slate-700 h-8 w-8 p-0 rounded-lg group"
          >
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      )
    }
  ]

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
              <p className="text-slate-400 font-medium animate-pulse">Sincronizando relatórios...</p>
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
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                Gestão de Relatórios
              </h1>
            </div>
            <p className="text-slate-400">Configure queries personalizadas e gerencie o acesso aos dados</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/relatorios/novo')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95 border-0 uppercase tracking-widest text-xs"
            >
              <Plus className="w-5 h-5 mr-2" />
              NOVO RELATÓRIO
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute right-[-10%] top-[-10%] rotate-12 opacity-[0.03] transition-transform group-hover:scale-110">
              <FileText size={120} />
            </div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total de Relatórios</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{stats.total}</span>
              <span className="text-[11px] text-slate-500 font-medium">Cadastrados</span>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute right-[-10%] top-[-10%] rotate-12 opacity-[0.03] transition-transform group-hover:scale-110">
              <CheckCircle2 size={120} />
            </div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Relatórios Ativos</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400">{stats.ativos}</span>
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">{(stats.total > 0 ? (stats.ativos / stats.total) * 100 : 0).toFixed(0)}% da base</span>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute right-[-10%] top-[-10%] rotate-12 opacity-[0.03] transition-transform group-hover:scale-110">
              <Star size={120} />
            </div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Favoritos</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-yellow-500">{stats.favoritos}</span>
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Destaques</span>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-slate-900/40 border border-white/5 p-1 rounded-2xl">
          <div className="flex flex-col lg:flex-row gap-4 p-4 lg:items-center">
            {/* Status Tabs */}
            <div className="flex p-1 bg-slate-950/50 rounded-xl border border-white/5 self-start lg:self-auto">
              {[
                { id: 'todos', label: 'Todos', icon: Filter },
                { id: 'ativos', label: 'Ativos', icon: CheckCircle2 },
                { id: 'inativos', label: 'Inativos', icon: AlertCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${statusFilter === tab.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrar relatórios por nome ou descrição..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-950/30 text-white text-sm rounded-xl border border-white/5 focus:border-purple-500 focus:outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Table Area */}
          <div className="p-1">
            {filteredRelatorios.length === 0 ? (
              <div className="py-20 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                  <Search className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-white font-bold text-lg">Nenhum relatório encontrado</h3>
                <p className="text-slate-500 text-sm max-w-[250px] mt-1">
                  Não encontramos registros para o filtro ou busca selecionada.
                </p>
              </div>
            ) : (
              <DataTable data={filteredRelatorios} columns={columns} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
