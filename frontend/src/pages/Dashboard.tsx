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
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">ForgeReports</h1>
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
            <p>Email: {user?.email}</p>
            <p>Perfil: {user?.role}</p>
          </div>
        </div>

        <div className="mt-8 bg-slate-800 rounded-lg p-8">
          <h3 className="text-xl font-bold text-white mb-4">Autenticação Configurada</h3>
          <div className="text-slate-300">
            <p className="mb-2">A FASE 1 está completa! Os seguintes recursos estão disponíveis:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Login com JWT</li>
              <li>Multi-tenancy por empresa</li>
              <li>Perfis de usuário (Admin, Técnico, Usuário)</li>
              <li>Proteção de rotas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
