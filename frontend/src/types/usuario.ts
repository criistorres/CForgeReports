export type UserRole = 'ADMIN' | 'TECNICO' | 'USUARIO';
export type UserStatus = 'ativo' | 'pendente' | 'inativo';

export interface Cargo {
    id: string;
    nome: string;
}

export interface Departamento {
    id: string;
    nome: string;
}

export interface Usuario {
    id: string;
    nome: string;
    email: string;
    role: UserRole;
    ativo: boolean;
    status: UserStatus;
    ativado_em: string | null;
    criado_em: string;
    atualizado_em?: string;
    criado_por_nome?: string;
    telefone?: string;
    cargo?: Cargo;
    departamento?: Departamento;
    cargo_nome?: string; // Para listagem
    departamento_nome?: string; // Para listagem
}

export interface CreateUsuarioData {
    nome: string;
    email: string;
    role: UserRole;
    telefone?: string;
    cargo?: string; // ID
    departamento?: string; // ID
}

export interface UpdateUsuarioData {
    nome: string;
    role: UserRole;
    telefone?: string;
    cargo?: string; // ID
    departamento?: string; // ID
}
