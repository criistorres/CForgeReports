import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '@/services/api'
import type { PastaNode } from './FolderTree'

interface PastaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  pastaAtual?: PastaNode | null
  pastaPai?: string | null
}

export function PastaModal({ isOpen, onClose, onSuccess, pastaAtual, pastaPai }: PastaModalProps) {
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState('#6366f1')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (pastaAtual) {
        setNome(pastaAtual.nome)
        setCor('#6366f1') // A API pode não retornar cor, então usamos padrão
      } else {
        setNome('')
        setCor('#6366f1')
      }
      setErro('')
    }
  }, [isOpen, pastaAtual])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome.trim()) {
      setErro('Nome da pasta é obrigatório')
      return
    }

    setLoading(true)
    setErro('')

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
      setErro(error.response?.data?.detail || 'Erro ao salvar pasta')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {pastaAtual ? 'Editar Pasta' : 'Nova Pasta'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome da Pasta
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Relatórios Mensais"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Cor (opcional, pode ser implementado depois) */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cor (opcional)
              </label>
              <div className="flex gap-2">
                {['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'].map((colorOption) => (
                  <button
                    key={colorOption}
                    type="button"
                    onClick={() => setCor(colorOption)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      cor === colorOption ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''
                    }`}
                    style={{ backgroundColor: colorOption }}
                  />
                ))}
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{erro}</p>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : pastaAtual ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
