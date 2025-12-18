import { useState } from 'react'
import {
  ChevronRight, ChevronDown, Folder, FolderOpen, Star, Clock,
  Plus, MoreVertical, Edit, Trash2, FolderPlus, FileText, Play
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export interface PastaNode {
  id: string
  nome: string
  pasta_pai: string | null
  qtd_relatorios: number
  qtd_subpastas: number
  subpastas?: PastaNode[]
  relatorios?: RelatorioNode[]
}

export interface RelatorioNode {
  id: string
  nome: string
  descricao?: string
}

export type ViewType = 'pasta' | 'favoritos' | 'recentes' | 'todos' | 'relatorio'

interface FolderTreeProps {
  pastas: PastaNode[]
  pastaSelecionada: string | null
  relatorioSelecionado: string | null
  onSelectPasta: (pastaId: string | null) => void
  onSelectRelatorio: (relatorioId: string) => void
  onSelectFavoritos: () => void
  onSelectRecentes: () => void
  viewAtual: ViewType
  onCriarPasta: (pastaPai?: string | null) => void
  onEditarPasta: (pasta: PastaNode) => void
  onExcluirPasta: (pasta: PastaNode) => void
  isAdmin?: boolean
}

interface FolderItemProps {
  pasta: PastaNode
  nivel: number
  pastaSelecionada: string | null
  relatorioSelecionado: string | null
  onSelectPasta: (pastaId: string) => void
  onSelectRelatorio: (relatorioId: string) => void
  expandedFolders: Set<string>
  onToggleExpand: (pastaId: string) => void
  onCriarSubpasta: (pastaPai: string) => void
  onEditar: (pasta: PastaNode) => void
  onExcluir: (pasta: PastaNode) => void
  isAdmin?: boolean
}

interface RelatorioItemProps {
  relatorio: RelatorioNode
  nivel: number
  isSelected: boolean
  onSelect: (relatorioId: string) => void
  isAdmin?: boolean
}

function RelatorioItem({ relatorio, nivel, isSelected, onSelect, isAdmin }: RelatorioItemProps) {
  const navigate = useNavigate()

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all group
        ${isSelected
          ? 'bg-primary-600/30 border border-primary-400/50'
          : 'hover:bg-slate-700/50'
        }
      `}
      style={{ paddingLeft: `${28 + nivel * 16}px` }}
      onClick={() => onSelect(relatorio.id)}
    >
      <FileText className={`w-4 h-4 ${isSelected ? 'text-primary-400' : 'text-slate-400'}`} />

      <span className={`flex-1 text-sm truncate ${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>
        {relatorio.nome}
      </span>

      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/relatorios/${relatorio.id}/editar`)
            }}
            className="p-1 hover:bg-slate-600 rounded mr-1"
            title="Editar relatório"
          >
            <Edit className="w-3 h-3 text-slate-400 hover:text-white" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelect(relatorio.id)
          }}
          className="p-1 hover:bg-primary-600 rounded"
          title="Executar relatório"
        >
          <Play className="w-3 h-3 text-primary-400" />
        </button>
      </div>
    </div>
  )
}

function FolderItem({
  pasta,
  nivel,
  pastaSelecionada,
  relatorioSelecionado,
  onSelectPasta,
  onSelectRelatorio,
  expandedFolders,
  onToggleExpand,
  onCriarSubpasta,
  onEditar,
  onExcluir,
  isAdmin
}: FolderItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const isExpanded = expandedFolders.has(pasta.id)
  const isSelected = pastaSelecionada === pasta.id
  const hasSubpastas = pasta.subpastas && pasta.subpastas.length > 0
  const hasRelatorios = pasta.relatorios && pasta.relatorios.length > 0
  const hasChildren = hasSubpastas || hasRelatorios

  return (
    <div className="relative group">
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
          ${isSelected
            ? 'bg-slate-700/50 border border-slate-600'
            : 'hover:bg-slate-700/30'
          }
        `}
        style={{ paddingLeft: `${12 + nivel * 16}px` }}
        onClick={() => onSelectPasta(pasta.id)}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowMenu(!showMenu)
        }}
      >
        {/* Chevron para expandir/colapsar */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(pasta.id)
            }}
            className="p-0.5 hover:bg-slate-600 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Ícone da pasta */}
        {isExpanded ? (
          <FolderOpen className="w-4 h-4 text-primary-400" />
        ) : (
          <Folder className="w-4 h-4 text-slate-400" />
        )}

        {/* Nome da pasta */}
        <span className={`flex-1 text-sm truncate ${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>
          {pasta.nome}
        </span>

        {/* Contador de relatórios */}
        {pasta.qtd_relatorios > 0 && (
          <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
            {pasta.qtd_relatorios}
          </span>
        )}

        {/* Botão de menu (aparece no hover) */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600 rounded transition-opacity"
        >
          <MoreVertical className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Menu dropdown */}
      {showMenu && (
        <div className="absolute right-2 top-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 min-w-[180px]">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(false)
              onCriarSubpasta(pasta.id)
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 text-slate-300 text-sm transition-colors rounded-t-lg"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Nova Subpasta</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(false)
              onEditar(pasta)
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 text-slate-300 text-sm transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(false)
              onExcluir(pasta)
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 text-red-400 text-sm transition-colors rounded-b-lg"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir</span>
          </button>
        </div>
      )}

      {/* Conteúdo expandido: relatórios e subpastas */}
      {isExpanded && (
        <div>
          {/* Relatórios da pasta */}
          {hasRelatorios && (
            <div className="mt-1">
              {pasta.relatorios!.map((relatorio) => (
                <RelatorioItem
                  key={relatorio.id}
                  relatorio={relatorio}
                  nivel={nivel + 1}
                  isSelected={relatorioSelecionado === relatorio.id}
                  onSelect={onSelectRelatorio}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}

          {/* Subpastas */}
          {hasSubpastas && (
            <div className="mt-1">
              {pasta.subpastas!.map((subpasta) => (
                <FolderItem
                  key={subpasta.id}
                  pasta={subpasta}
                  nivel={nivel + 1}
                  pastaSelecionada={pastaSelecionada}
                  relatorioSelecionado={relatorioSelecionado}
                  onSelectPasta={onSelectPasta}
                  onSelectRelatorio={onSelectRelatorio}
                  expandedFolders={expandedFolders}
                  onToggleExpand={onToggleExpand}
                  onCriarSubpasta={onCriarSubpasta}
                  onEditar={onEditar}
                  onExcluir={onExcluir}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function FolderTree({
  pastas,
  pastaSelecionada,
  relatorioSelecionado,
  onSelectPasta,
  onSelectRelatorio,
  onSelectFavoritos,
  onSelectRecentes,
  viewAtual,
  onCriarPasta,
  onEditarPasta,
  onExcluirPasta,
  isAdmin
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const toggleExpand = (pastaId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pastaId)) {
        newSet.delete(pastaId)
      } else {
        newSet.add(pastaId)
      }
      return newSet
    })
  }

  const pastasRaiz = pastas.filter(p => !p.pasta_pai)

  return (
    <div className="w-72 h-full bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Navegação</h3>
          <button
            onClick={() => onCriarPasta(null)}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            title="Nova pasta"
          >
            <Plus className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {/* Seções Especiais */}
        <div className="p-2 border-b border-slate-700/50">
          <button
            onClick={onSelectFavoritos}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
              ${viewAtual === 'favoritos'
                ? 'bg-yellow-500/20 border border-yellow-500/30'
                : 'hover:bg-slate-700/50'
              }
            `}
          >
            <Star className={`w-4 h-4 ${viewAtual === 'favoritos' ? 'text-yellow-400' : 'text-slate-400'}`} />
            <span className={`text-sm ${viewAtual === 'favoritos' ? 'text-yellow-400 font-medium' : 'text-slate-300'}`}>
              Favoritos
            </span>
          </button>

          <button
            onClick={onSelectRecentes}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all mt-1
              ${viewAtual === 'recentes'
                ? 'bg-blue-500/20 border border-blue-500/30'
                : 'hover:bg-slate-700/50'
              }
            `}
          >
            <Clock className={`w-4 h-4 ${viewAtual === 'recentes' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span className={`text-sm ${viewAtual === 'recentes' ? 'text-blue-400 font-medium' : 'text-slate-300'}`}>
              Recentes
            </span>
          </button>
        </div>

        {/* Árvore de Pastas e Relatórios */}
        <div className="p-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
            Pastas
          </div>
          {pastasRaiz.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-8">
              <p>Nenhuma pasta criada</p>
              <button
                onClick={() => onCriarPasta(null)}
                className="mt-2 text-primary-400 hover:text-primary-300 text-xs"
              >
                Criar primeira pasta
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {pastasRaiz.map((pasta) => (
                <FolderItem
                  key={pasta.id}
                  pasta={pasta}
                  nivel={0}
                  pastaSelecionada={pastaSelecionada}
                  relatorioSelecionado={relatorioSelecionado}
                  onSelectPasta={onSelectPasta}
                  onSelectRelatorio={onSelectRelatorio}
                  expandedFolders={expandedFolders}
                  onToggleExpand={toggleExpand}
                  onCriarSubpasta={(pastaId) => onCriarPasta(pastaId)}
                  onEditar={onEditarPasta}
                  onExcluir={onExcluirPasta}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
