import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Conexoes from './pages/Conexoes';
import Relatorios from './pages/Relatorios';
import RelatorioForm from './pages/RelatorioForm';
import ExecutarRelatorio from './pages/ExecutarRelatorio';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/conexoes"
        element={
          <PrivateRoute>
            <Conexoes />
          </PrivateRoute>
        }
      />
      <Route
        path="/relatorios"
        element={
          <PrivateRoute>
            <Relatorios />
          </PrivateRoute>
        }
      />
      <Route
        path="/relatorios/novo"
        element={
          <PrivateRoute>
            <RelatorioForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/relatorios/:id/editar"
        element={
          <PrivateRoute>
            <RelatorioForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/relatorios/:id/executar"
        element={
          <PrivateRoute>
            <ExecutarRelatorio />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
