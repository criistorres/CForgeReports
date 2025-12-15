import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">ForgeReports</h1>
              <div className="border-l border-slate-600 pl-4">
                <span className="text-sm text-slate-400">Empresa:</span>
                <span className="ml-2 text-white font-medium">{user?.empresa_nome}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-slate-300">
                <span className="font-medium">{user?.nome}</span>
                <span className="text-sm text-slate-400 ml-2">({user?.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Bem-vindo, {user?.nome}!
          </h2>
          <div className="text-slate-300 space-y-2">
            <p><span className="text-slate-400">Empresa:</span> <span className="font-medium">{user?.empresa_nome}</span></p>
            <p><span className="text-slate-400">Email:</span> {user?.email}</p>
            <p><span className="text-slate-400">Perfil:</span> {user?.role}</p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-4">Recursos do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Card Conexões */}
            <div className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition cursor-pointer border border-slate-700 hover:border-purple-500"
                 onClick={() => navigate('/conexoes')}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-2xl">
                  🔌
                </div>
                <h4 className="ml-4 text-lg font-bold text-white">Conexões</h4>
              </div>
              <p className="text-slate-400 text-sm">
                Gerencie conexões com bancos de dados SQL Server, PostgreSQL e MySQL
              </p>
              <div className="mt-4 text-purple-400 text-sm font-medium">
                ✓ FASE 2 Implementada
              </div>
            </div>

            {/* Card Relatórios */}
            <div className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition cursor-pointer border border-slate-700 hover:border-purple-500"
                 onClick={() => navigate('/relatorios')}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-2xl">
                  📊
                </div>
                <h4 className="ml-4 text-lg font-bold text-white">Relatórios</h4>
              </div>
              <p className="text-slate-400 text-sm">
                Crie e execute queries SQL com exportação para Excel
              </p>
              <div className="mt-4 text-purple-400 text-sm font-medium">
                ✓ FASE 3 Implementada
              </div>
            </div>

            {/* Card Execuções */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 opacity-60">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center text-2xl">
                  🚀
                </div>
                <h4 className="ml-4 text-lg font-bold text-white">Execuções</h4>
              </div>
              <p className="text-slate-400 text-sm">
                Visualize resultados e exporte para Excel
              </p>
              <div className="mt-4 text-slate-500 text-sm font-medium">
                Em breve - FASE 4
              </div>
            </div>

            {/* Card Usuários */}
            {(user?.role === 'ADMIN') && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 opacity-60">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center text-2xl">
                    👥
                  </div>
                  <h4 className="ml-4 text-lg font-bold text-white">Usuários</h4>
                </div>
                <p className="text-slate-400 text-sm">
                  Gerencie usuários e permissões da empresa
                </p>
                <div className="mt-4 text-slate-500 text-sm font-medium">
                  Em breve - FASE 5
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-green-900/50">
          <h3 className="text-lg font-bold text-green-400 mb-3">✓ Status do Desenvolvimento</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-white font-medium mb-2">FASE 1 - Autenticação ✓</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-slate-400">
                <li>Login com JWT</li>
                <li>Multi-tenancy por empresa</li>
                <li>Perfis de usuário (Admin, Técnico, Usuário)</li>
                <li>Proteção de rotas</li>
              </ul>
            </div>
            <div>
              <p className="text-white font-medium mb-2">FASE 2 - Conexões ✓</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-slate-400">
                <li>CRUD de conexões de banco</li>
                <li>Suporte SQL Server, PostgreSQL, MySQL</li>
                <li>Teste de conectividade</li>
                <li>Senhas criptografadas (AES)</li>
              </ul>
            </div>
            <div>
              <p className="text-white font-medium mb-2">FASE 3 - Relatórios ✓</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-slate-400">
                <li>CRUD de relatórios SQL</li>
                <li>Validação de queries (apenas SELECT)</li>
                <li>Execução e visualização de dados</li>
                <li>Exportação para Excel</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
