import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Star, Clock, Plus, MoreVertical, Edit, Trash2, FolderPlus } from 'lucide-react'

export interface PastaNode {
  id: string
  nome: string
  pasta_pai: string | null
  qtd_relatorios: number
  qtd_subpastas: number
  subpastas?: PastaNode[]
}

export type ViewType = 'pasta' | 'favoritos' | 'recentes' | 'todos'

interface FolderTreeProps {
  pastas: PastaNode[]
  pastaSelecionada: string | null
  onSelectPasta: (pastaId: string | null) => void
  onSelectFavoritos: () => void
  onSelectRecentes: () => void
  viewAtual: ViewType
  onCriarPasta: (pastaPai?: string | null) => void
  onEditarPasta: (pasta: PastaNode) => void
  onExcluirPasta: (pasta: PastaNode) => void
}

interface FolderItemProps {
  pasta: PastaNode
  nivel: number
  pastaSelecionada: string | null
  onSelect: (pastaId: string) => void
  expandedFolders: Set<string>
  onToggleExpand: (pastaId: string) => void
  onCriarSubpasta: (pastaPai: string) => void
  onEditar: (pasta: PastaNode) => void
  onExcluir: (pasta: PastaNode) => void
}

function FolderItem({ pasta, nivel, pastaSelecionada, onSelect, expandedFolders, onToggleExpand, onCriarSubpasta, onEditar, onExcluir }: FolderItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const isExpanded = expandedFolders.has(pasta.id)
  const isSelected = pastaSelecionada === pasta.id
  const hasSubpastas = pasta.subpastas && pasta.subpastas.length > 0

  return (
    <div className="relative group">
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
          ${isSelected
            ? 'bg-primary-200 border border-primary-400/30'
            : 'hover:bg-slate-700/50'
          }
        `}
        style={{ paddingLeft: `${12 + nivel * 16}px` }}
        onClick={() => onSelect(pasta.id)}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowMenu(!showMenu)
        }}
      >
        {/* Chevron para expandir/colapsar */}
        {hasSubpastas ? (
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
        <span className="text-xs text-slate-500">{pasta.qtd_relatorios}</span>

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
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 text-slate-300 text-sm transition-colors"
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

      {/* Subpastas */}
      {isExpanded && pasta.subpastas && (
        <div>
          {pasta.subpastas.map((subpasta) => (
            <FolderItem
              key={subpasta.id}
              pasta={subpasta}
              nivel={nivel + 1}
              pastaSelecionada={pastaSelecionada}
              onSelect={onSelect}
              expandedFolders={expandedFolders}
              onToggleExpand={onToggleExpand}
              onCriarSubpasta={onCriarSubpasta}
              onEditar={onEditar}
              onExcluir={onExcluir}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FolderTree({
  pastas,
  pastaSelecionada,
  onSelectPasta,
  onSelectFavoritos,
  onSelectRecentes,
  viewAtual,
  onCriarPasta,
  onEditarPasta,
  onExcluirPasta
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

  // Organiza pastas em árvore (apenas pastas raiz no primeiro nível)
  const pastasRaiz = pastas.filter(p => !p.pasta_pai)

  return (
    <div className="w-64 h-full bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Navegação</h3>
      </div>

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
          <span className={`text-sm ${viewAtual === 'favoritos' ? 'text-yellow-300 font-medium' : 'text-slate-300'}`}>
            Favoritos
          </span>
        </button>

        <button
          onClick={onSelectRecentes}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
            ${viewAtual === 'recentes' 
              ? 'bg-blue-500/20 border border-blue-500/30' 
              : 'hover:bg-slate-700/50'
            }
          `}
        >
          <Clock className={`w-4 h-4 ${viewAtual === 'recentes' ? 'text-blue-400' : 'text-slate-400'}`} />
          <span className={`text-sm ${viewAtual === 'recentes' ? 'text-blue-300 font-medium' : 'text-slate-300'}`}>
            Recentes
          </span>
        </button>
      </div>

      {/* Pastas */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pastas</span>
          <button
            onClick={() => onCriarPasta(null)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title="Nova pasta"
          >
            <Plus className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {pastasRaiz.length === 0 ? (
          <p className="px-3 py-2 text-sm text-slate-500">Nenhuma pasta criada</p>
        ) : (
          pastasRaiz.map((pasta) => (
            <FolderItem
              key={pasta.id}
              pasta={pasta}
              nivel={0}
              pastaSelecionada={pastaSelecionada}
              onSelect={onSelectPasta}
              expandedFolders={expandedFolders}
              onToggleExpand={toggleExpand}
              onCriarSubpasta={(pastaPai) => onCriarPasta(pastaPai)}
              onEditar={onEditarPasta}
              onExcluir={onExcluirPasta}
            />
          ))
        )}
      </div>

      {/* Botão "Todos os Relatórios" */}
      <div className="p-2 border-t border-slate-700/50">
        <button
          onClick={() => onSelectPasta(null)}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
            ${viewAtual === 'todos' 
              ? 'bg-primary-200 border border-primary-400/30' 
              : 'hover:bg-slate-700/50'
            }
          `}
        >
          <Folder className={`w-4 h-4 ${viewAtual === 'todos' ? 'text-primary-400' : 'text-slate-400'}`} />
          <span className={`text-sm ${viewAtual === 'todos' ? 'text-white font-medium' : 'text-slate-300'}`}>
            Todos os Relatórios
          </span>
        </button>
      </div>
    </div>
  )
}
