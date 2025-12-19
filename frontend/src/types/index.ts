// Types and interfaces for ForgeReports
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'TECNICO' | 'USUARIO';
  empresa_id: string;
  empresa_nome: string;
  telefone?: string;
  cargo_nome?: string;
  departamento_nome?: string;
}

export interface Empresa {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface Conexao {
  id: string;
  nome: string;
  tipo: 'SQLSERVER' | 'POSTGRESQL' | 'MYSQL';
  host: string;
  porta: number;
  database: string;
  usuario: string;
  ativo: boolean;
  ultimo_teste_ok: boolean | null;
  ultimo_teste_em: string | null;
  criado_em: string;
}
