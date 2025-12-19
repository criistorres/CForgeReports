import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ForgeLogo } from '@/components/layout/ForgeLogo';
import { getAuthErrorMessage } from '@/utils/errorMessages';
import '@/styles/auth-redesign.css';

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
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      {/* Background Elements */}
      <div className="auth-bg-gradient" />
      <div className="auth-orb orb-1" />
      <div className="auth-orb orb-2" />

      <div className="w-full max-w-md px-4 animate-slide-up">
        <div className="auth-glass-card rounded-2xl p-8 md:p-10">
          <div className="auth-header">
            <div className="flex justify-center mb-6">
              <ForgeLogo size={70} showText={false} />
            </div>
            <h1 className="auth-title">ForgeReports</h1>
            <p className="auth-subtitle">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg animate-shake">
                <p className="text-red-400 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <div className="auth-input-group">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-container">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                <Link to="#" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="auth-input-container">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign in to account'}
            </button>

            <div className="auth-divider">
              <span>new here?</span>
            </div>

            <div className="auth-footer-link" style={{ marginTop: 0 }}>
              Don't have an account?{' '}
              <Link to="/cadastro">Create organization</Link>
            </div>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-8">
          &copy; 2025 ForgeReports. All rights reserved.
        </p>
      </div>
    </div>
  );
}
