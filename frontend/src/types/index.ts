// Types and interfaces for ForgeReports
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'TECNICO' | 'USUARIO';
  empresa_id: string;
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
