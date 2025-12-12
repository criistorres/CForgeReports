# ForgeReports - Visão do Produto

## O Que É

Portal SaaS B2B de relatórios SQL. Empresas contratam para expor relatórios aos seus usuários com controle de acesso, filtros e histórico.

## Problema que Resolve

Empresas precisam disponibilizar relatórios de banco de dados para usuários não-técnicos, mas:
- Não querem dar acesso direto ao banco
- Precisam controlar quem vê o quê
- Querem histórico de quem acessou
- Usuários precisam de filtros simples, não escrever SQL

## Modelo de Negócio

| Item | Descrição |
|------|-----------|
| **Cobrança** | Por empresa (subscription mensal) |
| **Clientes** | Empresas de médio porte com dados em SQL Server/PostgreSQL |
| **Valor** | Simplicidade, controle, auditoria |

## Atores

```
┌─────────────────────────────────────────────────────┐
│                    EMPRESA                          │
│  (contrata o serviço, paga mensalidade)            │
└─────────────────────────────────────────────────────┘
            │
            ├── ADMINISTRADOR
            │   └── Gerencia tudo: usuários, conexões, relatórios
            │
            ├── TÉCNICO
            │   └── Cria conexões e relatórios, não gerencia usuários
            │
            └── USUÁRIO
                └── Apenas consome relatórios (executa, filtra, exporta)
```

## Fluxo Principal

```
1. Empresa contrata → Admin recebe acesso
2. Admin cadastra conexão do banco da empresa
3. Admin/Técnico cria relatórios (query SQL + filtros)
4. Admin dá permissão para usuários
5. Usuário faz login → vê seus relatórios → executa → exporta Excel
```

## Funcionalidades Core

| Funcionalidade | Descrição |
|----------------|-----------|
| **Multi-tenant** | Cada empresa isolada, dados não se misturam |
| **Conexões** | SQL Server, PostgreSQL, MySQL |
| **Relatórios** | Query SQL + nome + descrição + filtros |
| **Filtros** | Data, texto, número, lista (obrigatório/opcional) |
| **Permissões** | Por relatório: visualizar / exportar |
| **Histórico** | Quem executou, quando, com quais filtros |
| **Exportação** | Excel (.xlsx) |

## O Que Já Existe

### MVP (`forgereports/`)
- Backend Django funcional
- Conecta em SQL Server
- Executa queries
- Exporta Excel
- **Limitação**: Sem auth, sem multi-tenant, interface básica

### Protótipo UI (`forge-reports-standalone/`)
- HTML/CSS/JS estático
- Mostra como a interface final deve ser
- Não funciona (só visual)

## Diferencial

- Foco em simplicidade (não é um BI completo)
- Técnico cria, usuário consome
- Auditoria completa
- Multi-banco (SQL Server, PostgreSQL, MySQL)
