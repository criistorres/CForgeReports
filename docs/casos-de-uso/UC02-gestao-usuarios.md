# UC02 - Gestão de Usuários

## Resumo

Administrador gerencia usuários da empresa: criar, editar, desativar.

## Ator

Administrador

## Pré-condições

- Admin logado
- Empresa ativa

## Fluxo Principal - Criar Usuário

1. Admin acessa área de Usuários
2. Clica em "Novo Usuário"
3. Preenche:
   - Nome
   - Email
   - Role (Técnico ou Usuário)
4. Sistema valida email único
5. Sistema cria usuário inativo
6. Sistema envia email com link de ativação
7. Usuário aparece na lista como "Pendente"

## Fluxo Alternativo - Editar Usuário

1. Admin clica em usuário existente
2. Pode alterar: Nome, Role
3. Não pode alterar: Email (identificador)
4. Salva alterações

## Fluxo Alternativo - Desativar Usuário

1. Admin clica em "Desativar" no usuário
2. Sistema pede confirmação
3. Usuário fica inativo (não consegue logar)
4. Dados preservados (não deleta)

## Fluxo Alternativo - Reenviar Convite

1. Admin clica em "Reenviar" em usuário pendente
2. Novo email enviado
3. Link anterior invalidado

## Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| RN01 | Email único por empresa |
| RN02 | Admin não pode se desativar |
| RN03 | Deve existir pelo menos 1 admin ativo |
| RN04 | Link de ativação expira em 48h |
| RN05 | Respeitar limite de usuários do plano |

## Roles e Permissões

| Role | Descrição | Permissões |
|------|-----------|------------|
| ADMIN | Administrador | Tudo |
| TECNICO | Técnico | Conexões, relatórios, não gerencia usuários |
| USUARIO | Usuário final | Apenas consumir relatórios |

## Modelo de Dados

### Usuario

```typescript
{
  id: string
  empresaId: string
  nome: string
  email: string
  senhaHash: string | null
  role: 'ADMIN' | 'TECNICO' | 'USUARIO'
  ativo: boolean
  ativadoEm: datetime | null
  criadoEm: datetime
  atualizadoEm: datetime
}
```

## Interface

### Lista de Usuários
```
┌─────────────────────────────────────────────────┐
│ Usuários                        [+ Novo Usuário]│
├─────────────────────────────────────────────────┤
│ Nome          │ Email          │ Role    │ Status│
│ João Silva    │ joao@acme.com  │ Admin   │ Ativo │
│ Maria Santos  │ maria@acme.com │ Técnico │ Ativo │
│ Pedro Lima    │ pedro@acme.com │ Usuário │Pendente│
└─────────────────────────────────────────────────┘
```

### Modal Novo Usuário
```
┌─────────────────────────────────┐
│ Novo Usuário                  X │
├─────────────────────────────────┤
│ Nome:  [________________]       │
│ Email: [________________]       │
│ Role:  [Usuário ▼]             │
│                                 │
│        [Cancelar] [Criar]       │
└─────────────────────────────────┘
```

## Critérios de Aceite

- [ ] Admin consegue criar usuário
- [ ] Email de convite é enviado
- [ ] Usuário consegue ativar conta
- [ ] Admin consegue editar usuário
- [ ] Admin consegue desativar usuário
- [ ] Limite de usuários é respeitado
