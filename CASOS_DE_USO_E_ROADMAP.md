# ForgeReports - Casos de Uso e Roadmap de Desenvolvimento

## Visão do Produto

**ForgeReports** é um portal SaaS B2B de relatórios onde empresas contratam o serviço para expor relatórios SQL com controle de permissões, histórico e filtros dinâmicos.

### Modelo de Negócio
- **Cobrança**: Por empresa (subscription)
- **Atores principais**:
  - **Empresa**: Contrata o serviço
  - **Administrador/Técnico**: Configura conexões, cria relatórios, gerencia usuários
  - **Usuário**: Consome relatórios (visualiza, filtra, exporta)

---

## Casos de Uso

### UC01 - Cadastro de Empresa (Onboarding)

| Campo | Descrição |
|-------|-----------|
| **Ator** | Sistema / Comercial |
| **Pré-condição** | Empresa contratou o serviço |
| **Fluxo Principal** | 1. Criar registro da empresa no sistema<br>2. Definir plano/limites (usuários, conexões, relatórios)<br>3. Gerar credenciais do primeiro administrador<br>4. Enviar email de boas-vindas com link de ativação |
| **Pós-condição** | Empresa ativa com 1 administrador cadastrado |
| **Regras** | - Nome da empresa único no sistema<br>- Email do admin deve ser válido<br>- Slug/subdomínio único (ex: empresa-x.forgereports.com) |

---

### UC02 - Gestão de Usuários

| Campo | Descrição |
|-------|-----------|
| **Ator** | Administrador |
| **Pré-condição** | Admin logado |
| **Fluxo Principal** | 1. Acessar área de usuários<br>2. Criar novo usuário (nome, email, perfil)<br>3. Definir perfil: **Técnico** ou **Usuário**<br>4. Sistema envia convite por email<br>5. Usuário ativa conta e define senha |
| **Fluxos Alternativos** | - Editar usuário existente<br>- Desativar usuário<br>- Reenviar convite |
| **Regras** | - Email único por empresa<br>- Perfis: Admin, Técnico, Usuário<br>- Admin pode tudo, Técnico cria relatórios, Usuário só consome |

---

### UC03 - Cadastro de Conexão de Banco

| Campo | Descrição |
|-------|-----------|
| **Ator** | Administrador / Técnico |
| **Pré-condição** | Usuário logado com permissão |
| **Fluxo Principal** | 1. Acessar área de conexões<br>2. Clicar em "Nova Conexão"<br>3. Preencher dados:<br>&nbsp;&nbsp;- Nome da conexão (ex: "Banco Produção")<br>&nbsp;&nbsp;- Tipo: SQL Server, PostgreSQL, MySQL<br>&nbsp;&nbsp;- Host, Porta, Database<br>&nbsp;&nbsp;- Usuário e Senha<br>4. Clicar em "Testar Conexão"<br>5. Se sucesso, salvar conexão |
| **Fluxos Alternativos** | - Teste falha: exibir erro detalhado<br>- Editar conexão existente<br>- Desativar conexão |
| **Regras** | - Senha armazenada criptografada<br>- Conexão pertence à empresa (isolamento)<br>- Nome único por empresa |

**Tipos de banco suportados (Roadmap):**
- Fase 1: SQL Server
- Fase 2: PostgreSQL, MySQL
- Fase 3: Oracle, outros

---

### UC04 - Criação de Relatório

| Campo | Descrição |
|-------|-----------|
| **Ator** | Administrador / Técnico |
| **Pré-condição** | Pelo menos 1 conexão cadastrada |
| **Fluxo Principal** | 1. Acessar área de relatórios<br>2. Clicar em "Novo Relatório"<br>3. Preencher:<br>&nbsp;&nbsp;- Nome do relatório<br>&nbsp;&nbsp;- Descrição<br>&nbsp;&nbsp;- Pasta (opcional)<br>&nbsp;&nbsp;- Conexão de banco<br>&nbsp;&nbsp;- Query SQL (SELECT)<br>4. Definir filtros (UC05)<br>5. Testar execução<br>6. Salvar relatório |
| **Validações** | - Query deve ser SELECT (bloquear DML/DDL)<br>- Query deve executar em menos de 30s no teste<br>- Filtros devem ter placeholders válidos na query |

**Campos do Relatório:**
```
- nome: string (obrigatório)
- descricao: text (opcional)
- pasta_id: FK (opcional)
- conexao_id: FK (obrigatório)
- query_sql: text (obrigatório)
- ativo: boolean
- permite_exportar: boolean (default: true)
- limite_linhas_tela: int (default: 1000)
- criado_por: FK
- criado_em: datetime
- atualizado_em: datetime
```

---

### UC05 - Definição de Filtros do Relatório

| Campo | Descrição |
|-------|-----------|
| **Ator** | Administrador / Técnico |
| **Pré-condição** | Criando/editando um relatório |
| **Fluxo Principal** | 1. Na tela de relatório, acessar aba "Filtros"<br>2. Adicionar filtro:<br>&nbsp;&nbsp;- Nome do parâmetro (ex: `@data_inicio`)<br>&nbsp;&nbsp;- Label para usuário (ex: "Data Início")<br>&nbsp;&nbsp;- Tipo: Data, Texto, Número, Lista<br>&nbsp;&nbsp;- Obrigatório: Sim/Não<br>&nbsp;&nbsp;- Valor padrão (opcional)<br>3. Para tipo Lista: definir opções ou query de origem<br>4. Ordenar filtros (ordem de exibição) |
| **Exemplo** | Query: `SELECT * FROM vendas WHERE data >= @data_inicio AND vendedor_id = @vendedor`<br>Filtros: data_inicio (Data, obrigatório), vendedor (Lista, opcional) |

**Tipos de Filtro:**
| Tipo | Input | Exemplo |
|------|-------|---------|
| Data | Datepicker | 2024-01-15 |
| Texto | Text input | "João Silva" |
| Número | Number input | 1500.00 |
| Lista Fixa | Select/Dropdown | ["Ativo", "Inativo"] |
| Lista Dinâmica | Select (query) | Query que busca vendedores |

---

### UC06 - Gestão de Permissões de Relatório

| Campo | Descrição |
|-------|-----------|
| **Ator** | Administrador / Técnico |
| **Pré-condição** | Relatório criado |
| **Fluxo Principal** | 1. Acessar relatório > aba "Permissões"<br>2. Adicionar usuários/grupos com acesso<br>3. Definir nível:<br>&nbsp;&nbsp;- **Visualizar**: pode executar e ver em tela<br>&nbsp;&nbsp;- **Exportar**: pode também baixar Excel |
| **Alternativa** | - Permissão por pasta (herda para relatórios dentro)<br>- "Todos os usuários" como opção |

---

### UC07 - Consumo de Relatório (Usuário Final)

| Campo | Descrição |
|-------|-----------|
| **Ator** | Usuário |
| **Pré-condição** | Usuário logado, tem permissão no relatório |
| **Fluxo Principal** | 1. Acessar dashboard ou lista de relatórios<br>2. Ver apenas relatórios com permissão<br>3. Clicar no relatório desejado<br>4. Preencher filtros obrigatórios<br>5. (Opcional) Preencher filtros opcionais<br>6. Clicar em "Executar"<br>7. Visualizar resultado em tabela<br>8. (Opcional) Exportar para Excel |
| **Regras** | - Exibir máximo de X linhas em tela (config do relatório)<br>- Excel pode ter todas as linhas<br>- Registrar execução no histórico |

---

### UC08 - Favoritos

| Campo | Descrição |
|-------|-----------|
| **Ator** | Usuário |
| **Fluxo** | 1. Na lista de relatórios, clicar no ícone de estrela<br>2. Relatório aparece na seção "Favoritos" do dashboard<br>3. Clicar novamente remove dos favoritos |

---

### UC09 - Histórico de Execuções

| Campo | Descrição |
|-------|-----------|
| **Ator** | Administrador / Técnico / Usuário |
| **Fluxo Principal** | 1. Acessar "Histórico" (admin vê todos, usuário vê só seus)<br>2. Visualizar lista com:<br>&nbsp;&nbsp;- Relatório executado<br>&nbsp;&nbsp;- Quem executou<br>&nbsp;&nbsp;- Quando<br>&nbsp;&nbsp;- Filtros utilizados<br>&nbsp;&nbsp;- Tempo de execução<br>&nbsp;&nbsp;- Quantidade de linhas<br>&nbsp;&nbsp;- Se exportou ou não |
| **Uso** | - Auditoria<br>- Debug de performance<br>- Re-executar com mesmos filtros |

---

### UC10 - Relatórios Agendados (Futuro)

| Campo | Descrição |
|-------|-----------|
| **Ator** | Administrador / Técnico |
| **Fluxo** | 1. No relatório, ativar "Agendamento"<br>2. Definir frequência (diário, semanal, mensal)<br>3. Definir horário<br>4. Definir valores dos filtros<br>5. Definir ação: Enviar por email / Disponibilizar para download |
| **Resultado** | Sistema executa automaticamente e notifica usuários |

---

### UC11 - Organização em Pastas

| Campo | Descrição |
|-------|-----------|
| **Ator** | Administrador / Técnico |
| **Fluxo** | 1. Criar estrutura de pastas (hierárquica)<br>2. Mover relatórios para pastas<br>3. Definir permissões por pasta (opcional) |
| **Exemplo** | ```Financeiro/├── Contas a Pagar/├── Contas a Receber/└── Fluxo de Caixa/Vendas/├── Diário/└── Mensal/``` |

---

## Roadmap de Desenvolvimento

### Fase 0 - Preparação (Base)

**Objetivo**: Estruturar o projeto para desenvolvimento do produto completo

| Item | Descrição |
|------|-----------|
| Definir stack frontend | React? Vue? Next.js? |
| Configurar projeto | Monorepo ou separado (API + Frontend) |
| Configurar banco de dados | PostgreSQL para dados do sistema |
| Configurar autenticação | JWT + Refresh tokens |
| CI/CD básico | Deploy automatizado |

**Entregável**: Projeto estruturado, ambiente de dev funcionando

---

### Fase 1 - Autenticação e Multi-tenancy

**Objetivo**: Base segura com isolamento por empresa

| Item | Caso de Uso |
|------|-------------|
| Modelo de Empresa | UC01 |
| Modelo de Usuário | UC02 |
| Login / Logout | - |
| Recuperação de senha | - |
| Isolamento por empresa | Toda query filtra por empresa_id |
| Tela de login | - |
| Middleware de autenticação | - |

**Entregável**: Sistema de login funcionando, empresas isoladas

---

### Fase 2 - Conexões de Banco

**Objetivo**: Permitir cadastro e teste de conexões

| Item | Caso de Uso |
|------|-------------|
| CRUD de conexões | UC03 |
| Teste de conexão | UC03 |
| Criptografia de senhas | UC03 |
| Suporte SQL Server | UC03 |
| Interface de gestão | UC03 |

**Entregável**: Técnico consegue cadastrar e testar conexões SQL Server

---

### Fase 3 - Relatórios Básicos

**Objetivo**: Criar e executar relatórios simples (sem filtros)

| Item | Caso de Uso |
|------|-------------|
| CRUD de relatórios | UC04 |
| Editor de query | UC04 |
| Validação de query (SELECT only) | UC04 |
| Execução de relatório | UC07 |
| Visualização em tabela | UC07 |
| Export para Excel | UC07 |
| Limite de linhas em tela | UC07 |

**Entregável**: Fluxo completo Técnico cria → Usuário executa → Exporta Excel

---

### Fase 4 - Filtros

**Objetivo**: Relatórios com parâmetros dinâmicos

| Item | Caso de Uso |
|------|-------------|
| Definição de filtros | UC05 |
| Tipos: Data, Texto, Número | UC05 |
| Filtros obrigatórios/opcionais | UC05 |
| Valores padrão | UC05 |
| Interface de filtros para usuário | UC07 |
| Validação de preenchimento | UC07 |

**Entregável**: Relatórios parametrizados funcionando

---

### Fase 5 - Permissões

**Objetivo**: Controle de acesso granular

| Item | Caso de Uso |
|------|-------------|
| Permissão por relatório | UC06 |
| Níveis: Visualizar / Exportar | UC06 |
| Usuário vê só seus relatórios | UC07 |
| Interface de gestão de permissões | UC06 |

**Entregável**: Controle de quem vê o quê

---

### Fase 6 - Organização e UX

**Objetivo**: Melhorar experiência do usuário

| Item | Caso de Uso |
|------|-------------|
| Pastas/categorias | UC11 |
| Favoritos | UC08 |
| Busca de relatórios | - |
| Dashboard do usuário | - |
| Interface responsiva | - |

**Entregável**: Sistema organizado e agradável de usar

---

### Fase 7 - Histórico e Auditoria

**Objetivo**: Rastreabilidade completa

| Item | Caso de Uso |
|------|-------------|
| Log de execuções | UC09 |
| Filtros utilizados | UC09 |
| Tempo de execução | UC09 |
| Quantidade de linhas | UC09 |
| Interface de histórico | UC09 |
| Re-executar do histórico | UC09 |

**Entregável**: Auditoria completa de uso

---

### Fase 8 - Múltiplos Bancos

**Objetivo**: Suportar outros bancos além de SQL Server

| Item | Caso de Uso |
|------|-------------|
| PostgreSQL | UC03 |
| MySQL | UC03 |
| Abstração de conexão | UC03 |
| Teste por tipo de banco | UC03 |

**Entregável**: Flexibilidade de bancos de dados

---

### Fase 9 - Filtros Avançados

**Objetivo**: Listas dinâmicas e dependências

| Item | Caso de Uso |
|------|-------------|
| Lista dinâmica (query) | UC05 |
| Filtro dependente | UC05 (ex: Estado → Cidade) |
| Cache de listas | - |

**Entregável**: Filtros inteligentes

---

### Fase 10 - Agendamento

**Objetivo**: Execução automática de relatórios

| Item | Caso de Uso |
|------|-------------|
| Configuração de schedule | UC10 |
| Worker de execução | UC10 |
| Notificação por email | UC10 |
| Armazenamento de resultado | UC10 |

**Entregável**: Relatórios automáticos

---

## Resumo Visual do Roadmap

```
┌─────────────────────────────────────────────────────────────────┐
│                         FASE 0                                  │
│                    Preparação / Setup                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FASE 1: Auth + Multi-tenant  │  FASE 2: Conexões de Banco     │
│  - Login/Logout               │  - CRUD conexões               │
│  - Empresas isoladas          │  - Teste de conexão            │
│  - Gestão de usuários         │  - SQL Server                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 3: Relatórios Básicos                   │
│                    (Query + Execução + Excel)                   │
│                                                                 │
│  ★ PRIMEIRO MARCO UTILIZÁVEL - MVP do Standalone ★              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FASE 4: Filtros              │  FASE 5: Permissões            │
│  - Parâmetros na query        │  - Quem vê o quê               │
│  - Tipos de filtro            │  - Visualizar vs Exportar      │
│  - Obrigatório/opcional       │                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 6: Organização + UX                     │
│                    (Pastas, Favoritos, Busca)                   │
│                                                                 │
│  ★ SEGUNDO MARCO - Produto Completo Básico ★                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FASE 7: Histórico    │  FASE 8: Multi-DB   │  FASE 9: Filtros │
│  - Auditoria          │  - PostgreSQL       │    Avançados     │
│  - Logs               │  - MySQL            │  - Listas query  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 10: Agendamento                         │
│                    (Execução automática)                        │
│                                                                 │
│  ★ TERCEIRO MARCO - Produto Completo Enterprise ★               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Critérios de Sucesso por Marco

### Marco 1 - MVP Standalone (Fases 0-3)
- [ ] Empresa consegue se cadastrar
- [ ] Técnico consegue criar conexão e relatório
- [ ] Usuário consegue executar e exportar
- [ ] **Validação**: 1 cliente piloto usando em produção

### Marco 2 - Produto Básico (Fases 4-6)
- [ ] Relatórios com filtros funcionam
- [ ] Permissões controlam acesso
- [ ] Interface organizada e intuitiva
- [ ] **Validação**: 3+ clientes pagantes

### Marco 3 - Enterprise (Fases 7-10)
- [ ] Auditoria completa
- [ ] Múltiplos bancos
- [ ] Agendamento
- [ ] **Validação**: Clientes com requisitos avançados atendidos

---

## Decisões Técnicas Pendentes

| Decisão | Opções | Recomendação |
|---------|--------|--------------|
| Frontend Framework | React, Vue, Next.js, Nuxt | Next.js (React + SSR) |
| API Style | REST, GraphQL | REST (simplicidade) |
| Autenticação | JWT, Session | JWT + Refresh Token |
| Banco do Sistema | PostgreSQL, MySQL | PostgreSQL |
| Fila/Jobs | Celery, Bull, RabbitMQ | Celery (já usa Python) |
| Deploy | Vercel, AWS, Railway | Railway ou AWS |
| Monorepo | Sim, Não | Sim (Turborepo) |

---

## Próximos Passos

1. **Validar este documento** - Revisar casos de uso e roadmap
2. **Decidir stack técnica** - Frontend, infra, etc.
3. **Iniciar Fase 0** - Estruturar projeto
4. **Desenvolver Fase 1** - Auth + Multi-tenant

---

*Documento criado em: Dezembro 2024*
*Versão: 1.0*
