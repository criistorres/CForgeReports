# UC04 - Criação de Relatório

## Resumo

Técnico cria relatório: define query SQL, metadados e configurações básicas.

## Ator

Administrador ou Técnico

## Pré-condições

- Usuário logado com role ADMIN ou TECNICO
- Pelo menos 1 conexão ativa cadastrada

## Fluxo Principal

1. Usuário acessa área de Relatórios
2. Clica em "Novo Relatório"
3. Preenche:
   - Nome
   - Descrição (opcional)
   - Conexão (select das disponíveis)
   - Query SQL
4. Clica em "Testar Query"
5. Sistema executa com LIMIT 10
6. Mostra preview do resultado
7. Se erro: mostra mensagem
8. Usuário salva relatório

## Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| RN01 | Query deve ser SELECT (bloquear INSERT, UPDATE, DELETE, DROP, etc) |
| RN02 | Query deve executar em menos de 30s no teste |
| RN03 | Nome único por empresa |
| RN04 | Relatório criado fica inativo até ter permissões |
| RN05 | Respeitar limite de relatórios do plano |

## Validação de Query

```typescript
// Queries BLOQUEADAS (case insensitive)
const BLOCKED_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP',
  'TRUNCATE', 'ALTER', 'CREATE', 'EXEC',
  'EXECUTE', 'GRANT', 'REVOKE'
]

// Query deve começar com SELECT (após trim e remover comentários)
```

## Modelo de Dados

### Relatorio

```typescript
{
  id: string
  empresaId: string
  conexaoId: string
  nome: string
  descricao: string | null
  querySql: string
  ativo: boolean

  // Configurações
  limiteLinhasTela: number (default: 1000)
  permiteExportar: boolean (default: true)

  // Metadata
  criadoPorId: string
  criadoEm: datetime
  atualizadoEm: datetime
}
```

## Interface

### Lista de Relatórios
```
┌──────────────────────────────────────────────────────┐
│ Relatórios                        [+ Novo Relatório] │
├──────────────────────────────────────────────────────┤
│ Nome              │ Conexão    │ Status  │ Ações    │
│ Vendas Diárias    │ Produção   │ Ativo   │ [Editar] │
│ Estoque Atual     │ Produção   │ Ativo   │ [Editar] │
│ Clientes Inativos │ BI         │ Inativo │ [Editar] │
└──────────────────────────────────────────────────────┘
```

### Editor de Relatório
```
┌─────────────────────────────────────────────────────────┐
│ Novo Relatório                                        X │
├─────────────────────────────────────────────────────────┤
│ Nome:      [Vendas Diárias_________________________]   │
│ Descrição: [Relatório de vendas do dia atual_______]   │
│ Conexão:   [Produção ▼]                                │
│                                                         │
│ Query SQL:                                              │
│ ┌─────────────────────────────────────────────────────┐│
│ │ SELECT                                              ││
│ │   data_venda,                                       ││
│ │   cliente,                                          ││
│ │   valor                                             ││
│ │ FROM vendas                                         ││
│ │ WHERE data_venda = CAST(GETDATE() AS DATE)         ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ [Testar Query]                                         │
│                                                         │
│ Preview (10 linhas):                                   │
│ ┌─────────────────────────────────────────────────────┐│
│ │ data_venda │ cliente      │ valor    │             ││
│ │ 2024-01-15 │ Acme Corp    │ 1.500,00 │             ││
│ │ 2024-01-15 │ Beta Ltda    │ 2.300,00 │             ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│                          [Cancelar] [Salvar]           │
└─────────────────────────────────────────────────────────┘
```

## Editor de Query

Funcionalidades desejáveis:
- Syntax highlighting SQL
- Auto-complete de keywords
- Ctrl+Enter para testar
- Mostrar erro com linha destacada

Bibliotecas sugeridas:
- Monaco Editor (VSCode)
- CodeMirror

## Critérios de Aceite

- [ ] Criar relatório com query válida funciona
- [ ] Query com INSERT/DELETE é bloqueada
- [ ] Teste de query mostra preview
- [ ] Erro de query mostra mensagem clara
- [ ] Editar relatório funciona
- [ ] Limite de relatórios é respeitado
