import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { InfoIcon, Trash2Icon, PlusIcon, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface Permissao {
  id: string
  usuario_id: string
  usuario_nome: string
  usuario_email: string
  nivel: 'VISUALIZAR' | 'EXPORTAR'
}

interface Usuario {
  id: string
  nome: string
  email: string
  role: string
}

interface PermissoesFormProps {
  relatorioId: string
}

export default function PermissoesForm({ relatorioId }: PermissoesFormProps) {
  const [permissoes, setPermissoes] = useState<Permissao[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [novoUsuarioId, setNovoUsuarioId] = useState('')
  const [novoNivel, setNovoNivel] = useState<'VISUALIZAR' | 'EXPORTAR'>('VISUALIZAR')
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    carregarDados()
  }, [relatorioId])

  async function carregarDados() {
    try {
      setLoading(true)
      const [permRes, usersRes] = await Promise.all([
        api.get(`/relatorios/${relatorioId}/permissoes/`),
        api.get('/usuarios/')
      ])
      setPermissoes(permRes.data)
      setUsuarios(usersRes.data.filter((u: Usuario) => u.role === 'USUARIO'))
    } catch (err) {
      showToast('Erro ao carregar permissões', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function adicionar() {
    if (!novoUsuarioId) return

    try {
      setSalvando(true)
      await api.post(`/relatorios/${relatorioId}/permissoes/`, {
        usuario_id: novoUsuarioId,
        nivel: novoNivel
      })
      await carregarDados()
      setNovoUsuarioId('')
      setNovoNivel('VISUALIZAR')
    } catch (err) {
      showToast('Erro ao adicionar permissão', 'error')
      console.error(err)
    } finally {
      setSalvando(false)
    }
  }

  async function remover(usuarioId: string) {
    if (!confirm('Deseja remover esta permissão?')) return

    try {
      setSalvando(true)
      await api.delete(`/relatorios/${relatorioId}/permissoes/`, {
        data: { usuario_id: usuarioId }
      })
      setPermissoes(permissoes.filter(p => p.usuario_id !== usuarioId))
    } catch (err) {
      showToast('Erro ao remover permissão', 'error')
      console.error(err)
    } finally {
      setSalvando(false)
    }
  }

  // Filtrar usuários que já têm permissão
  const usuariosDisponiveis = usuarios.filter(
    u => !permissoes.find(p => p.usuario_id === u.id)
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <div className="text-slate-400">Carregando permissões...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-purple-900/10 border-purple-500/20 text-purple-400">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription className="text-slate-300">
          Admin e Técnico sempre têm acesso total aos relatórios.
          Use este painel para gerenciar permissões de usuários comuns.
        </AlertDescription>
      </Alert>



      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Adicionar Permissão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <select
              value={novoUsuarioId}
              onChange={e => setNovoUsuarioId(e.target.value)}
              className="flex-1 bg-slate-700 border-slate-600 text-white p-2 rounded-md focus:ring-2 focus:ring-purple-500"
              disabled={salvando || usuariosDisponiveis.length === 0}
            >
              <option value="">
                {usuariosDisponiveis.length === 0
                  ? 'Todos os usuários já têm permissão'
                  : 'Selecione um usuário...'}
              </option>
              {usuariosDisponiveis.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.email})
                </option>
              ))}
            </select>

            <select
              value={novoNivel}
              onChange={e => setNovoNivel(e.target.value as 'VISUALIZAR' | 'EXPORTAR')}
              className="bg-slate-700 border-slate-600 text-white p-2 rounded-md focus:ring-2 focus:ring-purple-500"
              disabled={salvando}
            >
              <option value="VISUALIZAR">Visualizar</option>
              <option value="EXPORTAR">Exportar</option>
            </select>

            <Button
              onClick={adicionar}
              disabled={!novoUsuarioId || salvando}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
          <div className="mt-3 text-sm text-slate-400">
            <div><strong>Visualizar:</strong> pode executar e ver dados em tela</div>
            <div><strong>Exportar:</strong> pode também baixar Excel</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            Permissões Atuais ({permissoes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {permissoes.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Nenhuma permissão definida. Apenas Admin e Técnico podem acessar este relatório.
            </div>
          ) : (
            <div className="space-y-2">
              {permissoes.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-white font-medium">{p.usuario_nome}</div>
                    <div className="text-slate-400 text-sm">{p.usuario_email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`
                        ${p.nivel === 'EXPORTAR'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }
                      `}
                    >
                      {p.nivel}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remover(p.usuario_id)}
                      disabled={salvando}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
