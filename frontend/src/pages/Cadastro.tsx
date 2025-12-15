import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Cadastro() {
  const [empresaNome, setEmpresaNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Criar Nova Empresa</h1>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Dados da Empresa */}
          <div>
            <label className="block text-slate-400 mb-2 text-sm">Nome da Empresa</label>
            <input
              type="text"
              value={empresaNome}
              onChange={(e) => setEmpresaNome(e.target.value)}
              className="w-full p-3 bg-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Acme Corporation"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-2 text-sm">CNPJ</label>
            <input
              type="text"
              value={cnpj}
              onChange={handleCNPJChange}
              className="w-full p-3 bg-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="00.000.000/0000-00"
              required
            />
          </div>

          {/* Dados do Administrador */}
          <div className="pt-4 border-t border-slate-700">
            <p className="text-slate-400 text-sm mb-4">Dados do Administrador</p>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-2 text-sm">Seu Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-3 bg-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: João Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-2 text-sm">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-2 text-sm">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-2 text-sm">Confirmar Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 bg-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Digite a senha novamente"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white p-3 rounded font-semibold transition-colors"
          >
            {loading ? 'Criando...' : 'Criar Empresa'}
          </button>

          <div className="text-center text-slate-400 text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300">
              Fazer login
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
