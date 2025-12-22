import { useState } from 'react'
import {
  ChevronRight, ChevronDown, Folder, FolderOpen, Star, Clock,
  Plus, MoreVertical, Edit, Trash2, FolderPlus, FileText, Play, XCircle, Shield
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
  onAdicionarRelatorio?: (pasta: PastaNode) => void
  onRemoverRelatorio?: (relatorio: RelatorioNode) => void
  onGerenciarPermissoes?: (relatorio: RelatorioNode) => void
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
  onAdicionarRelatorio: (pasta: PastaNode) => void
  onRemoverRelatorio: (relatorio: RelatorioNode) => void
  onGerenciarPermissoes: (relatorio: RelatorioNode) => void
  isAdmin?: boolean
}

interface RelatorioItemProps {
  relatorio: RelatorioNode
  nivel: number
  isSelected: boolean
  onSelect: (relatorioId: string) => void
  onRemover: (relatorio: RelatorioNode) => void
  onGerenciarPermissoes: (relatorio: RelatorioNode) => void
  isAdmin?: boolean
}

function RelatorioItem({ relatorio, nivel, isSelected, onSelect, onRemover, onGerenciarPermissoes, isAdmin }: RelatorioItemProps) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      className={`
        relative flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all group/item
        ${isSelected
          ? 'bg-purple-500/15 border border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
          : 'hover:bg-white/5 border border-transparent hover:border-white/5'
        }
      `}
      style={{ paddingLeft: `${24 + nivel * 12}px` }}
      onClick={() => onSelect(relatorio.id)}
    >
      <FileText className={`w-3.5 h-3.5 transition-colors ${isSelected ? 'text-purple-400' : 'text-slate-500 group-hover/item:text-slate-300'}`} />

      <span className={`flex-1 text-[13px] truncate transition-colors ${isSelected ? 'text-white font-medium' : 'text-slate-400 group-hover/item:text-slate-200'}`}>
        {relatorio.nome}
      </span>

      {/* Menu Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowMenu(!showMenu)
        }}
        className="opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-white/10 rounded-lg transition-all"
        title="Ações"
      >
        <MoreVertical className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMenu(false) }} />
          <div className="absolute right-2 top-full mt-1 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 min-w-[180px] p-1 animate-in fade-in zoom-in-95 duration-150">
            {/* Executar */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(false); onSelect(relatorio.id) }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-purple-500/10 text-purple-400 text-sm transition-colors rounded-lg group"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Executar</span>
            </button>

            {isAdmin && (
              <>
                <div className="h-px bg-white/5 my-1" />

                {/* Editar */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); navigate(`/relatorios/${relatorio.id}/editar`) }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 text-slate-300 text-sm transition-colors rounded-lg group"
                >
                  <Edit className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                  <span>Editar Relatório</span>
                </button>

                {/* Gerenciar Permissões */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onGerenciarPermissoes(relatorio) }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 text-slate-300 text-sm transition-colors rounded-lg group"
                >
                  <Shield className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                  <span>Permissões</span>
                </button>

                <div className="h-px bg-white/5 my-1" />

                {/* Remover da Pasta */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onRemover(relatorio) }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-amber-500/10 text-amber-400 text-sm transition-colors rounded-lg group"
                >
                  <XCircle className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                  <span>Remover da Pasta</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
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
  onAdicionarRelatorio,
  onRemoverRelatorio,
  onGerenciarPermissoes,
  isAdmin
}: FolderItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const isExpanded = expandedFolders.has(pasta.id)
  const isSelected = pastaSelecionada === pasta.id
  const hasSubpastas = pasta.subpastas && pasta.subpastas.length > 0
  const hasRelatorios = pasta.relatorios && pasta.relatorios.length > 0
  const hasChildren = hasSubpastas || hasRelatorios

  return (
    <div className="relative group/folder">
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all border
          ${isSelected
            ? 'bg-white/10 border-white/15 shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
            : 'hover:bg-white/5 border-transparent hover:border-white/5'
          }
        `}
        style={{ paddingLeft: `${8 + nivel * 12}px` }}
        onClick={() => onSelectPasta(pasta.id)}
      >
        {/* Chevron */}
        <div className="w-5 flex items-center justify-center">
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand(pasta.id)
              }}
              className="p-1 hover:bg-white/10 rounded-md transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover/folder:text-slate-300" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover/folder:text-slate-300" />
              )}
            </button>
          )}
        </div>

        {/* Pasta Icon */}
        <div className={`p-1 rounded-lg transition-colors ${isSelected ? 'text-purple-400' : 'text-slate-500 group-hover/folder:text-slate-300'}`}>
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 fill-current opacity-20 absolute" />
          ) : (
            <Folder className="w-4 h-4 fill-current opacity-20 absolute" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4" />
          ) : (
            <Folder className="w-4 h-4" />
          )}
        </div>

        {/* Nome */}
        <span className={`flex-1 text-[13.5px] truncate transition-colors ${isSelected ? 'text-white font-semibold' : 'text-slate-400 group-hover/folder:text-slate-200'}`}>
          {pasta.nome}
        </span>

        {/* Contador */}
        {pasta.qtd_relatorios > 0 && (
          <span className="text-[10px] font-bold text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full border border-white/5">
            {pasta.qtd_relatorios}
          </span>
        )}

        {/* Menu Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="opacity-0 group-hover/folder:opacity-100 p-1.5 hover:bg-white/10 rounded-lg transition-all"
        >
          <MoreVertical className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-2 top-full mt-1 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 min-w-[200px] p-1 animate-in fade-in zoom-in duration-200">
            {isAdmin && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onAdicionarRelatorio(pasta) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 text-slate-300 text-sm transition-colors rounded-lg group"
                >
                  <Plus className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                  <span>Adicionar Relatório</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onCriarSubpasta(pasta.id) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 text-slate-300 text-sm transition-colors rounded-lg group"
                >
                  <FolderPlus className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                  <span>Nova Subpasta</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEditar(pasta) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 text-slate-300 text-sm transition-colors rounded-lg group"
                >
                  <Edit className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                  <span>Editar Pasta</span>
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onExcluir(pasta) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 text-red-400 text-sm transition-colors rounded-lg group"
                >
                  <Trash2 className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                  <span>Excluir Pasta</span>
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Children Content */}
      {isExpanded && (
        <div className="mt-1 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
          {hasRelatorios && pasta.relatorios!.map((rel) => (
            <RelatorioItem
              key={rel.id}
              relatorio={rel}
              nivel={nivel + 1}
              isSelected={relatorioSelecionado === rel.id}
              onSelect={onSelectRelatorio}
              onRemover={onRemoverRelatorio}
              onGerenciarPermissoes={onGerenciarPermissoes}
              isAdmin={isAdmin}
            />
          ))}
          {hasSubpastas && pasta.subpastas!.map((sub) => (
            <FolderItem
              key={sub.id}
              pasta={sub}
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
              onAdicionarRelatorio={onAdicionarRelatorio}
              onRemoverRelatorio={onRemoverRelatorio}
              onGerenciarPermissoes={onGerenciarPermissoes}
              isAdmin={isAdmin}
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
  relatorioSelecionado,
  onSelectPasta,
  onSelectRelatorio,
  onSelectFavoritos,
  onSelectRecentes,
  viewAtual,
  onCriarPasta,
  onEditarPasta,
  onExcluirPasta,
  onAdicionarRelatorio,
  onRemoverRelatorio,
  onGerenciarPermissoes,
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
    <div className="w-full h-full flex flex-col premium-scrollbar">
      {/* Action Area */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Navegação</h3>
          <button
            onClick={() => onCriarPasta(null)}
            className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-all border border-purple-500/20 group"
            title="Nova pasta"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Seções Especiais */}
        <div className="space-y-2">
          <button
            onClick={onSelectFavoritos}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
              ${viewAtual === 'favoritos'
                ? 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-500'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
              }
            `}
          >
            <div className={`p-1.5 rounded-lg transition-all ${viewAtual === 'favoritos' ? 'bg-yellow-500/20' : 'bg-slate-800/40 group-hover:bg-slate-700/60'}`}>
              <Star className={`w-4 h-4 ${viewAtual === 'favoritos' ? 'fill-yellow-500' : 'text-slate-400'}`} />
            </div>
            <span className="text-sm font-medium">Favoritos</span>
            {viewAtual === 'favoritos' && (
              <div className="ml-auto w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
            )}
          </button>

          <button
            onClick={onSelectRecentes}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
              ${viewAtual === 'recentes'
                ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
              }
            `}
          >
            <div className={`p-1.5 rounded-lg transition-all ${viewAtual === 'recentes' ? 'bg-purple-500/20' : 'bg-slate-800/40 group-hover:bg-slate-700/60'}`}>
              <Clock className={`w-4 h-4 ${viewAtual === 'recentes' ? 'text-purple-400' : 'text-slate-400'}`} />
            </div>
            <span className="text-sm font-medium">Recentes</span>
            {viewAtual === 'recentes' && (
              <div className="ml-auto w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
            )}
          </button>
        </div>
      </div>

      {/* Separator */}
      <div className="mx-6 h-px bg-white/5 my-4" />

      <div className="flex-1 overflow-y-auto premium-scrollbar px-3 pb-8">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 py-2 mb-2">
          Estrutura de Pastas
        </div>
        {pastasRaiz.length === 0 ? (
          <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/5 mx-3">
            <Folder className="w-8 h-8 text-slate-600 mx-auto mb-3 opacity-20" />
            <p className="text-slate-500 text-xs">Nenhuma pasta criada</p>
            <button
              onClick={() => onCriarPasta(null)}
              className="mt-3 text-purple-400 hover:text-purple-300 text-[11px] font-bold uppercase tracking-wider underline-offset-4 hover:underline"
            >
              Criar primeira
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
                onAdicionarRelatorio={(p) => onAdicionarRelatorio?.(p)}
                onRemoverRelatorio={(r) => onRemoverRelatorio?.(r)}
                onGerenciarPermissoes={(r) => onGerenciarPermissoes?.(r)}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
