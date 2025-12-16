import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ForgeCard, ForgeButton, ForgeInput, ForgeLabel } from '@/components/forge';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-forge-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">ForgeReports</h1>
          <p className="text-slate-400">Portal de Relatórios SQL</p>
        </div>

        <ForgeCard glowOnHover={false}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="notification error p-3 rounded-lg">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            <div>
              <ForgeLabel htmlFor="email">Email</ForgeLabel>
              <ForgeInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <ForgeLabel htmlFor="password">Senha</ForgeLabel>
              <ForgeInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <ForgeButton
              type="submit"
              disabled={loading}
              className="w-full"
              glow
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </ForgeButton>

            <div className="text-center text-slate-400 text-sm pt-4 border-t border-primary-200">
              Não tem uma conta?{' '}
              <Link to="/cadastro" className="text-primary-500 hover:text-primary-400 transition-colors">
                Criar nova empresa
              </Link>
            </div>
          </form>
        </ForgeCard>
      </div>
    </div>
  );
}
