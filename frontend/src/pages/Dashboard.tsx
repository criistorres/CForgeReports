import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ForgeCard, ForgeBadge } from '@/components/forge';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <AppLayout>
      <ForgeCard title={`Bem-vindo, ${user?.nome}!`} className="mb-8">
        <div className="text-slate-300 space-y-2">
          <p><span className="text-slate-400">Empresa:</span> <span className="font-medium">{user?.empresa_nome}</span></p>
          <p><span className="text-slate-400">Email:</span> {user?.email}</p>
          <p><span className="text-slate-400">Perfil:</span> <ForgeBadge variant="active">{user?.role}</ForgeBadge></p>
        </div>
      </ForgeCard>

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
