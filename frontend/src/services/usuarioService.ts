import api from './api';
import type { Usuario, CreateUsuarioData, UpdateUsuarioData, Cargo, Departamento } from '@/types/usuario';

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
    },

    // Cargos
    async listCargos(): Promise<Cargo[]> {
        const response = await api.get('/usuarios/cargos/');
        return response.data;
    },

    async createCargo(nome: string): Promise<Cargo> {
        const response = await api.post('/usuarios/cargos/', { nome });
        return response.data;
    },

    async deleteCargo(id: string): Promise<void> {
        await api.delete(`/usuarios/cargos/${id}/`);
    },

    // Departamentos
    async listDepartamentos(): Promise<Departamento[]> {
        const response = await api.get('/usuarios/departamentos/');
        return response.data;
    },

    async createDepartamento(nome: string): Promise<Departamento> {
        const response = await api.post('/usuarios/departamentos/', { nome });
        return response.data;
    },

    async deleteDepartamento(id: string): Promise<void> {
        await api.delete(`/usuarios/departamentos/${id}/`);
    }
};
