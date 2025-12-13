# UC03 - Conexões de Banco

## Resumo

Técnico cadastra conexões com bancos de dados externos (SQL Server, PostgreSQL, MySQL).

## Ator

Administrador ou Técnico

## Pré-condições

- Usuário logado com role ADMIN ou TECNICO
- Dados de conexão do banco disponíveis

## Fluxo Principal - Criar Conexão

1. Usuário acessa área de Conexões
2. Clica em "Nova Conexão"
3. Preenche:
   - Nome (identificador amigável)
   - Tipo (SQL Server, PostgreSQL, MySQL)
   - Host
   - Porta (preenchida com default do tipo)
   - Database
   - Usuário
   - Senha
4. Clica em "Testar Conexão"
5. Sistema tenta conectar
6. Se sucesso: habilita botão Salvar
7. Se erro: mostra mensagem detalhada
8. Usuário salva conexão

## Fluxo Alternativo - Editar Conexão

1. Usuário clica em conexão existente
2. Pode alterar qualquer campo
3. Deve testar novamente antes de salvar
4. Senha só é alterada se preenchida (campo em branco mantém atual)

## Fluxo Alternativo - Desativar Conexão

1. Usuário clica em "Desativar"
2. Sistema verifica se há relatórios usando a conexão
3. Se houver: avisa e pede confirmação
4. Conexão fica inativa
5. Relatórios dessa conexão param de funcionar

## Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| RN01 | Nome único por empresa |
| RN02 | Senha armazenada criptografada (AES-256) |
| RN03 | Teste obrigatório antes de salvar |
| RN04 | Respeitar limite de conexões do plano |
| RN05 | Conexão pertence a uma empresa (isolamento) |

## Tipos de Banco Suportados

| Tipo | Porta Default | Driver |
|------|---------------|--------|
| SQL Server | 1433 | mssql |
| PostgreSQL | 5432 | pg |
| MySQL | 3306 | mysql2 |

## Modelo de Dados

### Conexao

```typescript
{
  id: string
  empresaId: string
  nome: string
  tipo: 'SQLSERVER' | 'POSTGRESQL' | 'MYSQL'
  host: string
  porta: number
  database: string
  usuario: string
  senhaEncriptada: string
  ativo: boolean
  criadoEm: datetime
  atualizadoEm: datetime
  ultimoTesteEm: datetime | null
  ultimoTesteOk: boolean | null
}
```

## Interface

### Lista de Conexões
```
┌────────────────────────────────────────────────────────┐
│ Conexões                             [+ Nova Conexão]  │
├────────────────────────────────────────────────────────┤
│ Nome            │ Tipo       │ Host         │ Status  │
│ Produção        │ SQL Server │ 192.168.1.10 │ ✓ Ativo │
│ BI              │ PostgreSQL │ bi.acme.com  │ ✓ Ativo │
│ Legado          │ MySQL      │ 10.0.0.5     │ ✗ Inativo│
└────────────────────────────────────────────────────────┘
```

### Form de Conexão
```
┌─────────────────────────────────────┐
│ Nova Conexão                      X │
├─────────────────────────────────────┤
│ Nome:     [Produção____________]    │
│ Tipo:     [SQL Server ▼]           │
│ Host:     [192.168.1.10________]   │
│ Porta:    [1433___]                │
│ Database: [vendas______________]   │
│ Usuário:  [app_user____________]   │
│ Senha:    [••••••••____________]   │
│                                     │
│ [Testar Conexão]                   │
│ ✓ Conexão bem sucedida!            │
│                                     │
│        [Cancelar] [Salvar]         │
└─────────────────────────────────────┘
```

## Segurança

- Senha nunca retornada nas APIs (write-only)
- Criptografia AES-256 com chave em variável de ambiente
- Conexões testadas com timeout de 10 segundos
- Logs de acesso à conexão

## Critérios de Aceite

- [ ] Criar conexão SQL Server funciona
- [ ] Teste de conexão funciona
- [ ] Senha é criptografada no banco
- [ ] Editar conexão funciona
- [ ] Desativar conexão funciona
- [ ] Limite de conexões é respeitado
