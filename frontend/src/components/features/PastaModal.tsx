import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import api from '@/services/api'
import type { PastaNode } from './FolderTree'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'

interface PastaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  pastaAtual?: PastaNode | null
  pastaPai?: string | null
}

export function PastaModal({ isOpen, onClose, onSuccess, pastaAtual, pastaPai }: PastaModalProps) {
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState('#a855f7')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      if (pastaAtual) {
        setNome(pastaAtual.nome)
        setCor('#a855f7')
      } else {
        setNome('')
        setCor('#a855f7')
      }
    }
  }, [isOpen, pastaAtual])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome.trim()) {
      showToast('Nome da pasta é obrigatório', 'error')
      return
    }

    setLoading(true)

    try {
      const dados = {
        nome: nome.trim(),
        pasta_pai: pastaPai || null
      }

      if (pastaAtual) {
        // Editar pasta existente
        await api.put(`/pastas/${pastaAtual.id}/`, dados)
      } else {
        // Criar nova pasta
        await api.post('/pastas/', dados)
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar pasta:', error)
      showToast(error.response?.data?.detail || 'Erro ao salvar pasta', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {pastaAtual ? 'Editar Pasta' : 'Nova Pasta'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
              Nome da Pasta
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Relatórios de Vendas"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all"
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              Cor de Identificação
            </label>
            <div className="flex flex-wrap gap-2.5">
              {['#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setCor(colorOption)}
                  className={`w-10 h-10 rounded-xl transition-all relative group ${cor === colorOption ? 'ring-2 ring-white ring-offset-4 ring-offset-slate-900 scale-110 shadow-lg' : 'hover:scale-105 opacity-70 hover:opacity-100'
                    }`}
                  style={{ backgroundColor: colorOption }}
                >
                  {cor === colorOption && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="flex-1 text-slate-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </span>
              ) : pastaAtual ? 'Salvar Alterações' : 'Criar Pasta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
