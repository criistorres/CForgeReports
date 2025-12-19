import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { ForgeLogo } from '@/components/layout/ForgeLogo';
import { User, Building2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import '@/styles/auth-redesign.css';

export default function Cadastro() {
  const [step, setStep] = useState(0);
  const [empresaNome, setEmpresaNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 14);
    if (limited.length <= 2) return limited;
    if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
    if (limited.length <= 8) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
    if (limited.length <= 12) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setCnpj(formatted);
  };

  const validateStep = () => {
    setError('');
    if (step === 0) {
      if (!empresaNome) return 'Nome da empresa é obrigatório';
      if (cnpj.replace(/\D/g, '').length !== 14) return 'CNPJ inválido';
    }
    if (step === 1) {
      if (!nome) return 'Nome completo é obrigatório';
      if (!email || !email.includes('@')) return 'Email inválido';
    }
    if (step === 2) {
      if (password.length < 6) return 'A senha deve ter no mínimo 6 caracteres';
      if (password !== confirmPassword) return 'As senhas não coincidem';
    }
    return null;
  };

  const nextStep = () => {
    const stepError = validateStep();
    if (stepError) {
      setError(stepError);
      return;
    }
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(s => s - 1);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 2) {
      nextStep();
      return;
    }

    const finalError = validateStep();
    if (finalError) {
      setError(finalError);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/registrar/', {
        empresa_nome: empresaNome,
        cnpj: cnpj,
        nome,
        email,
        password,
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      window.location.href = '/dashboard';
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errorMessages = [];
        if (errorData.empresa_nome) errorMessages.push(errorData.empresa_nome[0]);
        if (errorData.cnpj) errorMessages.push(errorData.cnpj[0]);
        if (errorData.email) errorMessages.push(errorData.email[0]);
        if (errorData.nome) errorMessages.push(errorData.nome[0]);
        if (errorData.password) errorMessages.push(errorData.password[0]);
        setError(errorMessages.join('. ') || 'Erro ao criar conta');
      } else {
        setError('Erro ao criar cadastro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { title: 'Empresa', icon: Building2 },
    { title: 'Usuário', icon: User },
    { title: 'Segurança', icon: ShieldCheck },
  ];

  return (
    <div className="auth-container">
      {/* Background Elements */}
      <div className="auth-bg-gradient" />
      <div className="auth-orb orb-1" />
      <div className="auth-orb orb-2" />

      <div className="w-full max-w-lg px-4 py-8 animate-slide-up">
        <div className="auth-glass-card rounded-2xl p-8 md:p-10">
          <div className="auth-header">
            <div className="flex justify-center mb-6">
              <ForgeLogo size={60} showText={false} />
            </div>
            <h1 className="auth-title">ForgeReports</h1>
            <p className="auth-subtitle">Siga os passos para criar sua conta.</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-between items-center mb-10 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-primary-500 transition-all duration-300 -translate-y-1/2 z-0"
              style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i <= step;
              const isCurrent = i === step;
              return (
                <div key={i} className="relative z-10 flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCurrent ? 'bg-primary-500 text-white ring-4 ring-primary-500/20' :
                      isActive ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-500 border border-white/5'}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider mt-2 font-bold transition-colors ${isActive ? 'text-primary-400' : 'text-slate-500'}`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg">
                <p className="text-red-400 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <div className="min-h-[220px]">
              {/* Step 0: Empresa */}
              {step === 0 && (
                <div className="space-y-5 animate-slide-up">
                  <div className="auth-input-group">
                    <label htmlFor="empresaNome">Nome da Empresa</label>
                    <div className="auth-input-container">
                      <input
                        id="empresaNome"
                        type="text"
                        value={empresaNome}
                        onChange={(e) => setEmpresaNome(e.target.value)}
                        placeholder="Ex: Acme Corporation"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label htmlFor="cnpj">CNPJ</label>
                    <div className="auth-input-container">
                      <input
                        id="cnpj"
                        type="text"
                        value={cnpj}
                        onChange={handleCNPJChange}
                        placeholder="00.000.000/0000-00"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Usuário */}
              {step === 1 && (
                <div className="space-y-5 animate-slide-up">
                  <div className="auth-input-group">
                    <label htmlFor="nome">Seu Nome Completo</label>
                    <div className="auth-input-container">
                      <input
                        id="nome"
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: João da Silva"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label htmlFor="email">Email Corporativo</label>
                    <div className="auth-input-container">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contato@empresa.com"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Segurança */}
              {step === 2 && (
                <div className="space-y-5 animate-slide-up">
                  <div className="auth-input-group">
                    <label htmlFor="password">Criar Senha</label>
                    <div className="auth-input-container">
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="No mínimo 6 caracteres"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label htmlFor="confirmPassword">Confirmar Senha</label>
                    <div className="auth-input-container">
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita sua senha"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 px-4 py-3 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] auth-button"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {step === 2 ? 'Finalizar Cadastro' : 'Continuar'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="auth-footer-link">
                Já possui uma conta?{' '}
                <Link to="/login">Fazer login</Link>
              </div>
            </div>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-8">
          Ao se cadastrar, você concorda com nossos Termos de Uso e Privacidade.
        </p>
      </div>
    </div>
  );
}
