import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ToastProvider } from './hooks/useToast';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import LandingPage from './pages/LandingPage';
import MobileMockup from './pages/MobileMockup';
import Dashboard from './pages/Dashboard';
import Conexoes from './pages/Conexoes';
import Relatorios from './pages/Relatorios';
import RelatorioForm from './pages/RelatorioForm';
import ExecutarRelatorio from './pages/ExecutarRelatorio';
import Historico from './pages/Historico';
import { ListaUsuarios } from './pages/Usuarios/ListaUsuarios';
import { ModalCriarUsuario } from './components/usuarios/ModalCriarUsuario';
import { DetalheUsuario } from './pages/Usuarios/DetalheUsuario';
import Configuracoes from './pages/Configuracoes';

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
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/mobile-mockup" element={<MobileMockup />} />
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
        <Route
          path="/historico"
          element={
            <PrivateRoute>
              <Historico />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <ListaUsuarios />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios/novo"
          element={
            <PrivateRoute>
              <ModalCriarUsuario />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios/:id"
          element={
            <PrivateRoute>
              <DetalheUsuario />
            </PrivateRoute>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <PrivateRoute>
              <Configuracoes />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
