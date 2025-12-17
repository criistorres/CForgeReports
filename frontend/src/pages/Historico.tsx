import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ForgeCard } from '@/components/forge';
import api from '@/services/api';

interface Execucao {
  id: string;
  relatorio_id: string;
  relatorio_nome: string;
  usuario_nome: string;
  usuario_email: string;
  iniciado_em: string;
  finalizado_em: string;
  tempo_execucao_ms: number;
  sucesso: boolean;
  erro: string | null;
  qtd_linhas: number;
  exportou: boolean;
  filtros_usados: Record<string, any>;
}

export default function Historico() {
  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    sucesso: '',
    relatorio_id: ''
  });

  useEffect(() => {
    carregarHistorico();
  }, [filtros]);

  async function carregarHistorico() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.sucesso) params.append('sucesso', filtros.sucesso);
      if (filtros.relatorio_id) params.append('relatorio_id', filtros.relatorio_id);

      const response = await api.get(`/historico/?${params.toString()}`);
      setExecucoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text">Histórico de Execuções</h1>
        <p className="text-slate-400 mt-2">
          Visualize o histórico completo de execuções de relatórios
        </p>
      </div>

      {/* Filtros */}
      <ForgeCard className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Filtros</h2>
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Status</label>
            <select
              value={filtros.sucesso}
              onChange={(e) => setFiltros({ ...filtros, sucesso: e.target.value })}
              className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="true">Sucesso</option>
              <option value="false">Erro</option>
            </select>
          </div>
        </div>
      </ForgeCard>

      {/* Tabela de Execuções */}
      <ForgeCard>
        {loading ? (
          <div className="text-center text-slate-400 py-8">Carregando...</div>
        ) : execucoes.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            Nenhuma execução encontrada
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-slate-300 font-medium">Data/Hora</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Relatório</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Usuário</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Tempo</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Linhas</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {execucoes.map((exec) => (
                  <tr key={exec.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="p-4 text-white">
                      {new Date(exec.iniciado_em).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 text-white">{exec.relatorio_nome}</td>
                    <td className="p-4 text-slate-300">
                      <div className="text-sm">{exec.usuario_nome}</div>
                      <div className="text-xs text-slate-500">{exec.usuario_email}</div>
                    </td>
                    <td className="p-4">
                      {exec.sucesso ? (
                        <span className="text-green-400 flex items-center gap-1">
                          ✓ Sucesso
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1" title={exec.erro || ''}>
                          ✗ Erro
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-300">
                      {exec.tempo_execucao_ms ? `${(exec.tempo_execucao_ms / 1000).toFixed(2)}s` : '-'}
                    </td>
                    <td className="p-4 text-slate-300">
                      {exec.qtd_linhas?.toLocaleString('pt-BR') || '-'}
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/relatorios/${exec.relatorio_id}/executar`}
                        className="text-purple-400 hover:text-purple-300 text-sm"
                      >
                        Re-executar →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ForgeCard>
    </AppLayout>
  );
}
