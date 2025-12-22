import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  Filter,
  Calendar,
  User,
  FileText,
  Timer,
  Search,
  ChevronRight,
  Download,
  Activity,
  AlertCircle
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/hooks/useToast'
import api from '@/services/api'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getErrorMessage } from '@/utils/errorMessages'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/features/DataTable'
import type { ColumnDef } from '@tanstack/react-table'

interface Execucao {
  id: string
  relatorio_id: string
  relatorio_nome: string
  usuario_nome: string
  usuario_email: string
  iniciado_em: string
  finalizado_em: string
  tempo_execucao_ms: number
  sucesso: boolean
  erro: string | null
  qtd_linhas: number
  exportou: boolean
  filtros_usados: Record<string, any>
}

export default function Historico() {
  const [execucoes, setExecucoes] = useState<Execucao[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'sucesso' | 'erro'>('todos')
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    carregarHistorico()
  }, [])

  async function carregarHistorico() {
    try {
      setLoading(true)
      const response = await api.get('/historico/')
      setExecucoes(response.data)
    } catch (error: any) {
      const mensagem = getErrorMessage(error)
      showToast(mensagem, 'error')
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    return {
      total: execucoes.length,
      sucesso: execucoes.filter(e => e.sucesso).length,
      erro: execucoes.filter(e => !e.sucesso).length
    }
  }, [execucoes])

  const filteredExecucoes = useMemo(() => {
    return execucoes.filter(exec => {
      const matchesBusca =
        exec.relatorio_nome.toLowerCase().includes(busca.toLowerCase()) ||
        exec.usuario_nome.toLowerCase().includes(busca.toLowerCase())

      const matchesStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'sucesso' && exec.sucesso) ||
        (statusFilter === 'erro' && !exec.sucesso)

      return matchesBusca && matchesStatus
    })
  }, [execucoes, busca, statusFilter])

  const formatarTempo = (ms: number | null) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const columns: ColumnDef<Execucao>[] = [
    {
      accessorKey: 'relatorio_nome',
      header: 'Relatório',
      cell: (info) => (
        <div className="flex items-center gap-4 py-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform ${info.row.original.sucesso
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-red-500/10 border-red-500/20'
            }`}>
            <FileText className={`w-5 h-5 ${info.row.original.sucesso ? 'text-emerald-400' : 'text-red-400'}`} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-200 truncate">{info.getValue() as string}</span>
            <div className="flex items-center gap-2 mt-0.5">
              {info.row.original.exportou && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-black uppercase tracking-widest">
                  Exportado
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'usuario_nome',
      header: 'Executado por',
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center overflow-hidden">
            <User className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-300">{info.getValue() as string}</span>
            <span className="text-[10px] text-slate-500">{info.row.original.usuario_email}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'sucesso',
      header: 'Resultado',
      cell: (info) => {
        const sucesso = info.getValue() as boolean
        return (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${sucesso
              ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
              : 'text-red-400 bg-red-400/10 border-red-400/20'
            }`}>
            {sucesso ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {sucesso ? 'Sucesso' : 'Erro'}
          </div>
        )
      }
    },
    {
      accessorKey: 'iniciado_em',
      header: 'Momento',
      cell: (info) => (
        <div className="flex flex-col">
          <span className="text-xs text-slate-300 font-medium">
            {formatDistanceToNow(new Date(info.getValue() as string), { addSuffix: true, locale: ptBR })}
          </span>
          <span className="text-[10px] text-slate-500">
            {new Date(info.getValue() as string).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )
    },
    {
      id: 'performance',
      header: 'Performance',
      cell: (info) => (
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Timer className="w-3.5 h-3.5 opacity-50" />
            <span className="font-medium">{formatarTempo(info.row.original.tempo_execucao_ms)}</span>
          </div>
          {info.row.original.qtd_linhas > 0 && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Activity className="w-3.5 h-3.5 opacity-40" />
              <span>{info.row.original.qtd_linhas.toLocaleString('pt-BR')} linhas</span>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: (info) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/relatorios/${info.row.original.relatorio_id}/executar`)}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 h-8 px-3 text-[11px] font-black uppercase tracking-widest gap-2"
          >
            <Play className="w-3 h-3 fill-current" />
            Re-executar
          </Button>

          <Button
            variant="ghost"
            size="sm"
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
              <p className="text-slate-400 font-medium animate-pulse">Carregando histórico...</p>
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
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                Histórico de Execuções
              </h1>
            </div>
            <p className="text-slate-400">Rastreabilidade completa de todas as consultas realizadas no sistema</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute right-[-10%] top-[-10%] rotate-12 opacity-[0.03] transition-transform group-hover:scale-110">
              <Activity size={120} />
            </div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total de Execuções</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{stats.total}</span>
              <span className="text-[11px] text-slate-500 font-medium">Registros</span>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute right-[-10%] top-[-10%] rotate-12 opacity-[0.03] transition-transform group-hover:scale-110">
              <CheckCircle2 size={120} />
            </div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Sucesso</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400">{stats.sucesso}</span>
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">{(stats.total > 0 ? (stats.sucesso / stats.total) * 100 : 0).toFixed(0)}% de taxa</span>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute right-[-10%] top-[-10%] rotate-12 opacity-[0.03] transition-transform group-hover:scale-110">
              <AlertCircle size={120} />
            </div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Erros</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-red-500">{stats.erro}</span>
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Falhas registradas</span>
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
                { id: 'sucesso', label: 'Sucesso', icon: CheckCircle2 },
                { id: 'erro', label: 'Erros', icon: XCircle }
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
                placeholder="Filtrar por nome do relatório ou usuário..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-950/30 text-white text-sm rounded-xl border border-white/5 focus:border-purple-500 focus:outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Table Area */}
          <div className="p-1">
            {filteredExecucoes.length === 0 ? (
              <div className="py-20 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                  <Search className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-white font-bold text-lg">Nenhum registro encontrado</h3>
                <p className="text-slate-500 text-sm max-w-[250px] mt-1">
                  O histórico de auditoria não retornou resultados para os filtros aplicados.
                </p>
              </div>
            ) : (
              <DataTable data={filteredExecucoes} columns={columns} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
