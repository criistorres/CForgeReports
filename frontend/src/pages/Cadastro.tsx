import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { ForgeCard, ForgeButton, ForgeInput, ForgeLabel } from '@/components/forge';

export default function Cadastro() {
  const [empresaNome, setEmpresaNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCNPJ = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Limita a 14 dígitos
    const limited = numbers.slice(0, 14);

    // Aplica máscara: 00.000.000/0000-00
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    const cnpjNumeros = cnpj.replace(/\D/g, '');
    if (cnpjNumeros.length !== 14) {
      setError('CNPJ inválido');
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

      // Armazenar tokens e dados do usuário
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      // Recarregar a página para atualizar o contexto de autenticação
      window.location.href = '/dashboard';
    } catch (err: any) {
      const errorData = err.response?.data;

      if (errorData) {
        // Mostrar erros específicos de validação
        const errorMessages = [];
        if (errorData.empresa_nome) errorMessages.push(`Empresa: ${errorData.empresa_nome[0]}`);
        if (errorData.cnpj) errorMessages.push(`CNPJ: ${errorData.cnpj[0]}`);
        if (errorData.email) errorMessages.push(`Email: ${errorData.email[0]}`);
        if (errorData.nome) errorMessages.push(`Nome: ${errorData.nome[0]}`);
        if (errorData.password) errorMessages.push(`Senha: ${errorData.password[0]}`);

        setError(errorMessages.join('. ') || 'Erro ao criar cadastro');
      } else {
        setError('Erro ao criar cadastro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-forge-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">ForgeReports</h1>
          <p className="text-slate-400">Criar Nova Empresa</p>
        </div>

        <ForgeCard glowOnHover={false}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="notification error p-3 rounded-lg">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            {/* Dados da Empresa */}
            <div>
              <ForgeLabel htmlFor="empresaNome">Nome da Empresa</ForgeLabel>
              <ForgeInput
                id="empresaNome"
                type="text"
                value={empresaNome}
                onChange={(e) => setEmpresaNome(e.target.value)}
                placeholder="Ex: Acme Corporation"
                required
              />
            </div>

            <div>
              <ForgeLabel htmlFor="cnpj">CNPJ</ForgeLabel>
              <ForgeInput
                id="cnpj"
                type="text"
                value={cnpj}
                onChange={handleCNPJChange}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>

            {/* Dados do Administrador */}
            <div className="pt-4 border-t border-primary-200">
              <p className="text-slate-400 text-sm mb-4">Dados do Administrador</p>

              <div className="space-y-4">
                <div>
                  <ForgeLabel htmlFor="nome">Seu Nome</ForgeLabel>
                  <ForgeInput
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: João Silva"
                    required
                  />
                </div>

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
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>

                <div>
                  <ForgeLabel htmlFor="confirmPassword">Confirmar Senha</ForgeLabel>
                  <ForgeInput
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    required
                  />
                </div>
              </div>
            </div>

            <ForgeButton
              type="submit"
              disabled={loading}
              className="w-full"
              glow
            >
              {loading ? 'Criando...' : 'Criar Empresa'}
            </ForgeButton>

            <div className="text-center text-slate-400 text-sm pt-4 border-t border-primary-200">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-400 transition-colors">
                Fazer login
              </Link>
            </div>
          </form>
        </ForgeCard>
      </div>
    </div>
  );
}
