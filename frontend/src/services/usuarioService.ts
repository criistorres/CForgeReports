import api from './api';
import type { Usuario, CreateUsuarioData, UpdateUsuarioData } from '@/types/usuario';

export const usuarioService = {
    async list(): Promise<Usuario[]> {
        const response = await api.get('/usuarios/');
        return response.data;
    },

    async get(id: string): Promise<Usuario> {
        const response = await api.get(`/usuarios/${id}/`);
        return response.data;
    },

    async create(data: CreateUsuarioData): Promise<Usuario> {
        const response = await api.post('/usuarios/', data);
        return response.data;
    },

    async update(id: string, data: UpdateUsuarioData): Promise<Usuario> {
        const response = await api.patch(`/usuarios/${id}/`, data);
        return response.data;
    },

    async desativar(id: string): Promise<Usuario> {
        const response = await api.post(`/usuarios/${id}/desativar/`);
        return response.data;
    },

    async reativar(id: string): Promise<Usuario> {
        const response = await api.post(`/usuarios/${id}/reativar/`);
        return response.data;
    },

    async reenviarConvite(id: string): Promise<void> {
        await api.post(`/usuarios/${id}/reenviar_convite/`);
    },

    async redefinirSenha(id: string, senha: string): Promise<void> {
        await api.post(`/usuarios/${id}/redefinir_senha/`, { senha });
    }
};
