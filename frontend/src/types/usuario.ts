export type UserRole = 'ADMIN' | 'TECNICO' | 'USUARIO';
export type UserStatus = 'ativo' | 'pendente' | 'inativo';

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
}

export interface CreateUsuarioData {
    nome: string;
    email: string;
    role: UserRole;
}

export interface UpdateUsuarioData {
    nome: string;
    role: UserRole;
}
