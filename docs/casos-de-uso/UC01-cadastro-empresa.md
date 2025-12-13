# UC01 - Cadastro de Empresa

## Resumo

Onboarding de nova empresa no sistema. Cria tenant isolado e primeiro administrador.

## Ator

Sistema / Processo comercial (pode ser manual inicialmente)

## Pré-condições

- Empresa contratou o serviço
- Email do administrador disponível

## Fluxo Principal

1. Criar registro da empresa
2. Gerar slug único (ex: `acme` para acme.forgereports.com)
3. Criar usuário administrador
4. Enviar email com link de ativação
5. Admin clica no link e define senha
6. Empresa ativa

## Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| RN01 | Nome da empresa único no sistema |
| RN02 | Slug único, apenas letras minúsculas e números |
| RN03 | Email do admin deve ser válido |
| RN04 | Link de ativação expira em 48h |
| RN05 | Empresa inicia com plano default (limites padrão) |

## Modelo de Dados

### Empresa

```typescript
{
  id: string (uuid)
  nome: string
  slug: string (unique)
  ativo: boolean
  criadoEm: datetime

  // Limites do plano
  maxUsuarios: number (default: 10)
  maxConexoes: number (default: 5)
  maxRelatorios: number (default: 50)
}
```

### Usuario (primeiro admin)

```typescript
{
  id: string (uuid)
  empresaId: string (FK)
  nome: string
  email: string
  senhaHash: string (null até ativar)
  role: 'ADMIN' | 'TECNICO' | 'USUARIO'
  ativo: boolean
  ativadoEm: datetime | null
  criadoEm: datetime
}
```

## Interface

Fase inicial: Cadastro manual via script/admin
Fase futura: Tela de signup self-service

## Critérios de Aceite

- [ ] Empresa criada com dados corretos
- [ ] Slug gerado automaticamente do nome
- [ ] Admin criado com role ADMIN
- [ ] Email enviado com link de ativação
- [ ] Admin consegue ativar conta e fazer login
