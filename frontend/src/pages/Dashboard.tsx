import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ForgeCard, ForgeBadge } from '@/components/forge';
import api from '@/services/api';

interface Favorito {
  id: string;
  relatorio_id: string;
  relatorio_nome: string;
  relatorio_descricao: string;
}

interface Execucao {
  id: string;
  relatorio_id: string;
  relatorio_nome: string;
  iniciado_em: string;
  sucesso: boolean;
  tempo_execucao_ms: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [historico, setHistorico] = useState<Execucao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [favoritosRes, historicoRes] = await Promise.all([
          api.get('/favoritos/'),
          api.get('/historico/?limit=5')
        ]);
        setFavoritos(favoritosRes.data);
        setHistorico(historicoRes.data.slice(0, 5));
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  return (
    <AppLayout>
      <ForgeCard title={`Bem-vindo, ${user?.nome}!`} className="mb-8">
        <div className="text-slate-300 space-y-2">
          <p><span className="text-slate-400">Empresa:</span> <span className="font-medium">{user?.empresa_nome}</span></p>
          <p><span className="text-slate-400">Email:</span> {user?.email}</p>
          <p><span className="text-slate-400">Perfil:</span> <ForgeBadge variant="active">{user?.role}</ForgeBadge></p>
        </div>
      </ForgeCard>

      {/* Favoritos */}
      {!loading && favoritos.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            ⭐ Meus Favoritos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoritos.map((fav) => (
              <ForgeCard
                key={fav.id}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate(`/relatorios/${fav.relatorio_id}/executar`)}
              >
                <h3 className="text-white font-medium mb-2">{fav.relatorio_nome}</h3>
                <p className="text-slate-400 text-sm line-clamp-2">{fav.relatorio_descricao || 'Sem descrição'}</p>
              </ForgeCard>
            ))}
          </div>
        </section>
      )}

      {/* Histórico Recente */}
      {!loading && historico.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🕐 Execuções Recentes
            </h2>
            <Link
              to="/historico"
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Ver tudo →
            </Link>
          </div>
          <ForgeCard>
            <div className="space-y-3">
              {historico.map((exec) => (
                <div key={exec.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
                  <div className="flex-1">
                    <span className="text-white font-medium">{exec.relatorio_nome}</span>
                    <span className="text-slate-400 text-sm ml-4">
                      {new Date(exec.iniciado_em).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {exec.sucesso ? (
                      <span className="text-green-400 text-sm">✓ Sucesso</span>
                    ) : (
                      <span className="text-red-400 text-sm">✗ Erro</span>
                    )}
                    <Link
                      to={`/relatorios/${exec.relatorio_id}/executar`}
                      className="text-purple-400 hover:text-purple-300 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Re-executar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </ForgeCard>
        </section>
      )}

      <h2 className="text-2xl font-bold gradient-text mb-6">Recursos do Sistema</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Conexões */}
        <ForgeCard className="cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/conexoes')}>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-2xl shadow-glow-purple">
              🔌
            </div>
            <h4 className="ml-4 text-lg font-bold text-white">Conexões</h4>
          </div>
          <p className="text-slate-400 text-sm">
            Gerencie conexões com bancos de dados SQL Server, PostgreSQL e MySQL
          </p>
          <div className="mt-4">
            <ForgeBadge variant="active">FASE 2 ✓</ForgeBadge>
          </div>
        </ForgeCard>

        {/* Card Relatórios */}
        <ForgeCard className="cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/relatorios')}>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-2xl shadow-glow-purple">
              📊
            </div>
            <h4 className="ml-4 text-lg font-bold text-white">Relatórios</h4>
          </div>
          <p className="text-slate-400 text-sm">
            Crie e execute queries SQL com exportação para Excel
          </p>
          <div className="mt-4">
            <ForgeBadge variant="active">FASE 3 ✓</ForgeBadge>
          </div>
        </ForgeCard>

        {/* Card Execuções */}
        <ForgeCard className="opacity-60">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center text-2xl">
              🚀
            </div>
            <h4 className="ml-4 text-lg font-bold text-white">Execuções</h4>
          </div>
          <p className="text-slate-400 text-sm">
            Visualize resultados e exporte para Excel
          </p>
          <div className="mt-4">
            <ForgeBadge variant="pending">FASE 4</ForgeBadge>
          </div>
        </ForgeCard>

        {/* Card Usuários */}
        {(user?.role === 'ADMIN') && (
          <ForgeCard className="opacity-60">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center text-2xl">
                👥
              </div>
              <h4 className="ml-4 text-lg font-bold text-white">Usuários</h4>
            </div>
            <p className="text-slate-400 text-sm">
              Gerencie usuários e permissões da empresa
            </p>
            <div className="mt-4">
              <ForgeBadge variant="inactive">Em breve</ForgeBadge>
            </div>
          </ForgeCard>
        )}
      </div>
    </AppLayout>
  );
}
