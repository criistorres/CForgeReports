# ForgeReports - Roadmap de Desenvolvimento

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Status Atual](#-status-atual)
3. [Arquitetura de Dados](#-arquitetura-de-dados)
4. [Roadmap em Fases](#️-roadmap-em-fases)
   - [Fase 0: Preparação e Arquitetura Base](#fase-0-preparação-e-arquitetura-base)
   - [Fase 1: Autenticação e Models Base](#fase-1-autenticação-e-models-base)
   - [Fase 2: Multi-tenancy e Permissões](#fase-2-multi-tenancy-e-permissões)
   - [Fase 3: Gestão de Conexões de Banco](#fase-3-gestão-de-conexões-de-banco)
   - [Fase 4: Sistema de Pastas](#fase-4-sistema-de-pastas)
   - [Fase 5: CRUD de Relatórios](#fase-5-crud-de-relatórios)
   - [Fase 6: Sistema de Filtros Parametrizados](#fase-6-sistema-de-filtros-parametrizados)
   - [Fase 7: Engine de Execução e Histórico](#fase-7-engine-de-execução-e-histórico)
   - [Fase 8: Exportação Multi-formato](#fase-8-exportação-multi-formato)
   - [Fase 9: Dashboard e Analytics](#fase-9-dashboard-e-analytics)
5. [Fases Futuras](#-fases-futuras-pós-mvp-completo)
6. [Métricas de Progresso](#-métricas-de-progresso)
7. [Critérios de Qualidade](#-critérios-de-qualidade)
8. [Convenções do Projeto](#-convenções-do-projeto)
9. [Quick Start para IA](#-quick-start-para-ia)

---

## 🎯 Visão Geral

**ForgeReports** é um sistema Django multi-tenant para gestão empresarial de relatórios SQL. Permite que múltiplas empresas gerenciem suas conexões de banco de dados, criem relatórios SQL parametrizados, organizem em pastas hierárquicas e executem com controle completo de permissões e auditoria.

### Objetivo

Evoluir de um MVP funcional (3 views, sem banco de dados) para um sistema completo com:
- 10 tabelas relacionadas
- Sistema multi-tenant robusto
- Controle granular de permissões
- Filtros dinâmicos em relatórios
- Auditoria completa de execuções e exports
- Interface moderna com Tailwind CSS

### Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Backend | Django | 5.x |
| Linguagem | Python | 3.8+ |
| Database (Dev) | SQLite | 3.x |
| Database (Prod) | PostgreSQL | 14+ |
| SQL Connector | pyodbc | 4.x |
| Data Processing | pandas | 2.x |
| Excel Export | openpyxl | 3.x |
| Frontend | Tailwind CSS | 3.x |
| Testing | pytest-django | 4.x |

---

## 📊 Status Atual

### MVP Funcionando

**Localização**: `/Users/cristiantorres/Documents/GitHub/CForgeReports/forgereports/`

**Funcionalidades Implementadas**:
- ✅ Conexão SQL Server via pyodbc
- ✅ Teste de conectividade
- ✅ Execução de queries SELECT (limite 1000 registros)
- ✅ Validação básica de segurança (bloqueia DROP/DELETE/UPDATE)
- ✅ Visualização em tabela HTML
- ✅ Download Excel sem limite de registros
- ✅ Servidor Django rodando em http://127.0.0.1:8000

**Estrutura Atual**:
```
forgereports/
├── reports/
│   ├── views.py → 4 views implementadas
│   │   ├── dashboard()
│   │   ├── test_connection()
│   │   ├── execute_query()
│   │   └── download_excel()
│   ├── models.py → VAZIO
│   ├── templates/reports/dashboard.html
│   └── urls.py
├── forgereports/
│   ├── settings.py
│   └── urls.py
├── requirements.txt
├── README.md
└── manage.py
```

### Gap Analysis

| Componente | Atual | Objetivo | Gap |
|------------|-------|----------|-----|
| Models | 0 | 10 | 10 models a criar |
| Autenticação | Nenhuma | Django + Custom User | Sistema completo |
| Multi-tenancy | Single | Multi-tenant | Middleware + permissões |
| Conexões DB | Hardcoded | CRUD por empresa | Model + encryption |
| Relatórios | Ad-hoc | Salvos + versionados | CRUD + folders |
| Filtros | Nenhum | Parametrizados | Engine de parsing |
| Auditoria | Nenhuma | Completa | Logs execução/export |
| UI | Básica | Moderna Tailwind | Full redesign |

---

## 🏗 Arquitetura de Dados

### Resumo das 10 Tabelas

| # | Tabela | Descrição | Relações Principais |
|---|--------|-----------|---------------------|
| 1 | **companies** | Empresas do sistema | 1:N connections, folders, reports |
| 2 | **users** | Usuários (extends AbstractUser) | N:M companies via user_company_roles |
| 3 | **user_roles** | Perfis (super_admin, admin, user) | 1:N user_company_roles |
| 4 | **user_company_roles** | Associação user-empresa-role | N:1 users, companies, roles |
| 5 | **database_connections** | Conexões SQL por empresa | N:1 company, 1:N reports |
| 6 | **folders** | Organização hierárquica | N:1 company, self-reference parent |
| 7 | **reports** | Queries SQL salvas | N:1 company, connection, folder |
| 8 | **report_filters** | Filtros parametrizados | N:1 report |
| 9 | **report_executions** | Log de execuções | N:1 report, user |
| 10 | **report_exports** | Log de downloads | N:1 execution, user |

### Diagrama ER Simplificado

```
companies (empresas)
    ├─→ database_connections (1:N)
    ├─→ folders (1:N)
    │      ├─→ folders (self-reference - hierarquia)
    │      └─→ reports (1:N)
    ├─→ reports (1:N)
    └─→ user_company_roles (1:N)

users (usuários)
    ├─→ user_company_roles (1:N)
    ├─→ report_executions (1:N)
    └─→ report_exports (1:N)

user_roles (perfis)
    └─→ user_company_roles (1:N)

database_connections
    └─→ reports (1:N)

reports
    ├─→ report_filters (1:N)
    ├─→ report_executions (1:N)
    └─→ report_exports (via executions)

report_executions
    └─→ report_exports (1:N)
```

**Para o diagrama ER completo**: Veja `forgereports_schema.html` na raiz do projeto.

---

## 🗺️ Roadmap em Fases

---

## Fase 0: Preparação e Arquitetura Base

**Status**: 🔜 Próxima
**Duração Estimada**: 2-3 dias
**Complexidade**: Média
**Dependências**: Nenhuma

### Objetivo

Estabelecer fundação sólida antes do desenvolvimento. Refatorar estrutura Django atual para suportar crescimento, configurar ambientes, testes e documentação base.

### Decisões Arquiteturais Chave

1. **Estrutura Modular**: Múltiplos apps Django (companies, accounts, connections, folders, reports, exports)
2. **Settings por Ambiente**: base.py, development.py, production.py
3. **Testes com pytest**: pytest-django + fixtures reutilizáveis
4. **Logging Estruturado**: Logs em arquivo + console

### Tarefas Principais

#### 0.1 Reorganizar Estrutura de Diretórios

Criar estrutura modular:
```
forgereports/
├── apps/
│   ├── core/           # Shared utilities
│   ├── companies/      # Company management
│   ├── accounts/       # Auth & users
│   ├── connections/    # DB connections
│   ├── folders/        # Folder hierarchy
│   ├── reports/        # Reports (migrar atual)
│   └── exports/        # Export handling
├── config/
│   └── settings/
│       ├── base.py
│       ├── development.py
│       └── production.py
├── docs/
├── static/
├── templates/
└── tests/
```

#### 0.2 Configurar Requirements

Criar `requirements/`:
- `base.txt`: Django, pyodbc, pandas, openpyxl
- `development.txt`: pytest, debug-toolbar, ipython
- `production.txt`: psycopg2, gunicorn, sentry

#### 0.3 Setup de Testes

- Configurar `pytest.ini`
- Criar `conftest.py` com fixtures base
- Configurar coverage (mínimo 80%)

#### 0.4 Configurar Variáveis de Ambiente

- Criar `.env.example`
- Atualizar `.gitignore`
- Usar python-decouple

#### 0.5 Migrar Views Existentes

- Mover `reports/views.py` para `apps/reports/views.py`
- Atualizar imports e URLs
- Garantir funcionamento

### Checklist de Conclusão

- [ ] Estrutura de diretórios criada
- [ ] Settings refatoradas (base, dev, prod)
- [ ] Requirements organizadas
- [ ] pytest configurado e rodando
- [ ] .env.example criado
- [ ] .gitignore atualizado
- [ ] README.md expandido
- [ ] Views migradas e funcionando
- [ ] Servidor rodando sem erros
- [ ] Git commit: "refactor: reorganiza estrutura do projeto"

**Verificação**:
```bash
python manage.py check
pytest --collect-only
python manage.py runserver
```

---

## Fase 1: Autenticação e Models Base

**Status**: ⏳ Aguardando Fase 0
**Duração Estimada**: 3-4 dias
**Complexidade**: Média-Alta
**Dependências**: Fase 0 completa

### Objetivo

Implementar sistema de autenticação Django customizado e criar models fundamentais (Company, UserRole, User estendido).

### Models a Criar

#### 1.1 Model: Company

**Arquivo**: `apps/companies/models.py`

**Campos**:
- `company_id` (PK, AutoField)
- `company_name` (CharField, max=200)
- `cnpj` (CharField, max=18, unique, regex validation)
- `email` (EmailField)
- `active` (BooleanField, default=True)
- `created_at`, `updated_at` (timestamps)

**Validações**:
- CNPJ formato: `XX.XXX.XXX/XXXX-XX`
- CNPJ único no sistema

**Métodos**:
- `__str__()`: Retorna "Nome (CNPJ)"
- `total_users`: Property que conta usuários ativos
- `total_connections`: Conta conexões ativas
- `total_reports`: Conta relatórios ativos
- `deactivate()`: Desativa empresa e entidades relacionadas
- `activate()`: Reativa empresa

**Testes Necessários** (15 testes):
- test_company_creation
- test_company_str_representation
- test_company_cnpj_validation_valid
- test_company_cnpj_validation_invalid_format
- test_company_cnpj_unique
- test_company_email_validation
- test_company_default_active_true
- test_company_deactivate
- test_company_activate
- test_company_total_users_property
- test_company_ordering
- test_company_get_absolute_url
- test_company_field_max_lengths

#### 1.2 Model: UserRole

**Arquivo**: `apps/accounts/models.py`

**Campos**:
- `role_id` (PK, AutoField)
- `role_name` (CharField, max=50, unique, choices)
- `display_name` (CharField, max=100)
- `description` (TextField)
- `created_at`, `updated_at`

**Roles Padrão**:
- `super_admin`: Acesso total, cross-company
- `admin`: Administrador da empresa
- `user`: Usuário padrão

**Class Methods**:
- `get_super_admin()`: Retorna role super_admin
- `get_admin()`: Retorna role admin
- `get_user()`: Retorna role user

**Data Migration**: Criar migration para popular roles padrão

**Testes**: 7 testes para validação

#### 1.3 Model: User (Custom)

**Extends**: `AbstractUser`

**Campos Adicionais**:
- `full_name` (CharField, max=200)
- `phone` (CharField, max=20, optional)
- `companies` (ManyToMany via UserCompanyRole)

**Configuração**: `AUTH_USER_MODEL = 'accounts.User'` em settings

**Métodos**:
- `get_role_for_company(company)`: Retorna role em empresa
- `has_role_in_company(role_name, company)`: Verifica role
- `is_super_admin()`: Check se é super admin
- `is_admin_of_company(company)`: Check se é admin
- `get_companies()`: Lista empresas ativas

**Testes**: 10 testes

### Admin Django

Configurar admin para:
- Company (list_display, filters, actions, badges coloridos)
- UserRole (readonly fields)
- User (extender UserAdmin)

### Management Commands

**Criar**: `python manage.py seed_companies`
Popula 3 empresas de teste para desenvolvimento

### Checklist de Conclusão

- [ ] Model Company criado e testado (15 testes passing)
- [ ] Model UserRole criado e testado (7 testes passing)
- [ ] Model User customizado criado e testado (10 testes passing)
- [ ] TimestampedModel base criado em apps/core/
- [ ] AUTH_USER_MODEL configurado
- [ ] Migrations criadas e aplicadas
- [ ] Data migration para roles padrão
- [ ] Admin configurado (Company, User, UserRole)
- [ ] Fixtures/factories em conftest.py
- [ ] Coverage mínimo 80%
- [ ] seed_companies command
- [ ] Template de login criado
- [ ] URLs configuradas
- [ ] Git commit: "feat(accounts,companies): implementa models base e autenticação"

**Testes de Aceitação**:
```bash
pytest apps/companies/tests/ apps/accounts/tests/ -v
pytest --cov=apps.companies --cov=apps.accounts
python manage.py createsuperuser
python manage.py runserver
# Acessar /admin e criar empresa
# Acessar /accounts/login/
```

---

## Fase 2: Multi-tenancy e Permissões

**Status**: ⏳ Aguardando Fase 1
**Duração Estimada**: 4-5 dias
**Complexidade**: Alta
**Dependências**: Fase 1 completa

### Objetivo

Implementar sistema multi-tenant onde usuário pode ter diferentes roles em diferentes empresas. Criar middleware, decorators e views de seleção de empresa.

### 2.1 Model: UserCompanyRole

**Tabela Pivot**: Relaciona User × Company × Role

**Campos**:
- `id` (PK, AutoField)
- `user` (FK to User, CASCADE)
- `company` (FK to Company, CASCADE)
- `role` (FK to UserRole, PROTECT)
- `created_at`, `updated_at`

**Constraint**: `unique_together = [['user', 'company']]`

**Regra**: Usuário só pode ter UM role por empresa

**Testes**: 8 testes incluindo cascade delete e protect

### 2.2 Middleware: TenantMiddleware

**Arquivo**: `apps/accounts/middleware.py`

**Funcionalidade**:
- Adiciona `request.tenant` (empresa atual)
- Adiciona `request.user_companies` (lista de empresas)
- Adiciona `request.current_role` (role na empresa atual)
- Auto-seleciona se usuário tem apenas 1 empresa
- Redireciona para seleção se múltiplas empresas

**Fluxo**:
1. User não logado → tenant = None
2. User sem empresas → tenant = None
3. User com 1 empresa → auto-seleciona
4. User com N empresas → redireciona para select_company

**Testes**: 6 testes de middleware

### 2.3 Decorators de Permissão

**Arquivo**: `apps/accounts/decorators.py`

**Decorators**:
- `@require_tenant`: Garante que request.tenant existe
- `@require_role('admin')`: Requer role específico
- `@admin_required`: Shortcut para admin ou super_admin
- `@super_admin_required`: Apenas super_admin

**Exemplos**:
```python
@require_role('admin')
def criar_relatorio(request):
    # Apenas admins podem criar relatórios
    pass

@require_tenant
def dashboard(request):
    # Garante que tenant está selecionado
    print(request.tenant.company_name)
    pass
```

**Testes**: 8 testes de decorators

### 2.4 Views de Seleção

**View**: `select_company(request)`
- GET: Lista empresas do usuário
- POST: Salva empresa na sessão

**View**: `switch_company(request)`
- Limpa tenant e redireciona para seleção

**Template**: `templates/accounts/select_company.html`
- Lista com radio buttons
- Mostra nome, CNPJ e role do usuário

### 2.5 Template Tags Customizadas

**Arquivo**: `apps/accounts/templatetags/permissions.py`

**Tags**:
```django
{% load permissions %}

{% if request.user|has_role:'admin' %}
    <button>Criar Relatório</button>
{% endif %}

{% if request.user|is_admin_of:request.tenant %}
    <a href="#">Gerenciar Usuários</a>
{% endif %}
```

### 2.6 Context Processor

**Arquivo**: `apps/accounts/context_processors.py`

Adiciona ao contexto global:
- `tenant`: Empresa atual
- `current_role`: Role atual
- `user_companies`: Lista de empresas

### Checklist de Conclusão

- [ ] Model UserCompanyRole criado e testado (8 testes)
- [ ] TenantMiddleware implementado e testado (6 testes)
- [ ] Decorators criados e testados (8 testes)
- [ ] View select_company implementada
- [ ] View switch_company implementada
- [ ] Template select_company.html criado
- [ ] Template tags de permissão criadas
- [ ] Context processor configurado
- [ ] Admin para UserCompanyRole
- [ ] Fixtures atualizadas (create_user_company_role)
- [ ] Testes de integração (fluxo completo)
- [ ] Documentação de uso dos decorators
- [ ] Git commit: "feat(accounts): implementa multi-tenancy e permissões"

**Testes de Aceitação**:
```bash
# Criar usuário com múltiplas empresas
python manage.py shell
>>> from apps.accounts.models import User, UserRole, UserCompanyRole
>>> from apps.companies.models import Company
>>> user = User.objects.first()
>>> company1 = Company.objects.first()
>>> company2 = Company.objects.last()
>>> role = UserRole.get_admin()
>>> UserCompanyRole.objects.create(user=user, company=company1, role=role)
>>> UserCompanyRole.objects.create(user=user, company=company2, role=role)

# Testar login e seleção
# Acessar /accounts/login/
# Deve redirecionar para /accounts/select-company/
# Selecionar empresa
# Verificar que request.tenant está setado
```

---

## Fase 3: Gestão de Conexões de Banco

**Status**: ⏳ Aguardando Fase 2
**Duração Estimada**: 3-4 dias
**Complexidade**: Média
**Dependências**: Fase 2 completa

### Objetivo

Permitir que empresas cadastrem múltiplas conexões de banco de dados com credenciais criptografadas.

### 3.1 Model: DatabaseConnection

**Arquivo**: `apps/connections/models.py`

**Campos**:
- `connection_id` (PK, AutoField)
- `company` (FK to Company, CASCADE)
- `connection_name` (CharField, max=200)
- `db_type` (CharField, choices: sqlserver, postgresql, mysql, oracle)
- `host` (CharField, max=255)
- `port` (IntegerField)
- `database_name` (CharField, max=100)
- `username` (CharField, max=100)
- `password_encrypted` (TextField) - Criptografado!
- `active` (BooleanField, default=True)
- `created_at`, `updated_at`

**Métodos**:
- `set_password(plain_password)`: Criptografa e salva
- `get_password()`: Descriptografa e retorna
- `get_connection_string()`: Retorna connection string
- `test_connection()`: Testa conectividade

**Managers**:
- `ConnectionManager.active()`: Retorna apenas ativas

**Testes**: 12 testes

### 3.2 Service: EncryptionService

**Arquivo**: `apps/connections/services/encryption.py`

**Classe**: `EncryptionService`

**Métodos**:
- `encrypt(plain_text)`: Criptografa usando Fernet
- `decrypt(encrypted_text)`: Descriptografa

**Usa**: `cryptography.fernet.Fernet`
**Key**: Armazenada em settings como `ENCRYPTION_KEY`

**Testes**: 5 testes

### 3.3 Service: ConnectionManager

**Arquivo**: `apps/connections/services/connector.py`

**Classe**: `ConnectionManager`

**Métodos**:
- `get_connection(db_connection)`: Retorna pyodbc/psycopg2 connection
- `test_connection(db_connection)`: Testa se conecta
- `execute_query(db_connection, query, params)`: Executa query segura

**Testes**: 8 testes (com mocking)

### 3.4 Views CRUD

**URLs**: `/connections/`

**Views**:
- `ConnectionListView` (GET): Lista conexões da empresa
- `ConnectionCreateView` (GET/POST): Cria conexão
- `ConnectionUpdateView` (GET/POST): Edita conexão
- `ConnectionDeleteView` (POST): Soft delete
- `connection_test` (POST/AJAX): Testa conexão

**Permissões**: `@admin_required` para todas

**Templates**:
- `connections/list.html`
- `connections/form.html` (create/update)

### 3.5 Forms

**Arquivo**: `apps/connections/forms.py`

**Form**: `DatabaseConnectionForm`

**Campos**:
- connection_name (required)
- db_type (select)
- host (required)
- port (integer, default por db_type)
- database_name (required)
- username (required)
- password (PasswordInput, required on create)

**Validações**:
- Validar formato de host
- Validar porta (1-65535)
- Test connection opcional (checkbox)

### 3.6 Adaptar View Existente

**View**: `reports/views.py → test_connection()`

Refatorar para usar `DatabaseConnection` model ao invés de params hardcoded.

### Checklist de Conclusão

- [ ] Model DatabaseConnection criado e testado (12 testes)
- [ ] EncryptionService implementado e testado (5 testes)
- [ ] ConnectionManager implementado e testado (8 testes)
- [ ] ENCRYPTION_KEY configurada em settings
- [ ] Views CRUD implementadas
- [ ] Forms criados e validados
- [ ] Templates criados (list, form)
- [ ] URLs configuradas
- [ ] Admin configurado
- [ ] View test_connection adaptada
- [ ] Testes de integração (criar, editar, testar, deletar)
- [ ] Git commit: "feat(connections): implementa gestão de conexões de banco"

**Testes de Aceitação**:
```bash
# Criar conexão via interface
# Acessar /connections/
# Clicar em "Nova Conexão"
# Preencher formulário
# Testar conexão
# Salvar
# Editar conexão
# Deletar conexão
```

---

## Fase 4: Sistema de Pastas

**Status**: ⏳ Aguardando Fase 3
**Duração Estimada**: 2-3 dias
**Complexidade**: Média
**Dependências**: Fase 3 completa

### Objetivo

Criar sistema hierárquico de pastas para organizar relatórios.

### 4.1 Model: Folder

**Arquivo**: `apps/folders/models.py`

**Campos**:
- `folder_id` (PK, AutoField)
- `company` (FK to Company, CASCADE)
- `parent_folder` (FK to self, NULL, CASCADE) - Hierarquia!
- `folder_name` (CharField, max=200)
- `description` (TextField, optional)
- `created_at`, `updated_at`

**Constraints**:
- `unique_together = [['company', 'parent_folder', 'folder_name']]`
- Não pode ter 2 pastas com mesmo nome no mesmo nível

**Métodos**:
- `get_children()`: Retorna subpastas diretas
- `get_ancestors()`: Retorna caminho completo (breadcrumb)
- `get_descendants()`: Retorna todas subpastas (recursivo)
- `get_breadcrumb()`: Lista de ancestors para exibição
- `can_delete()`: Verifica se pode deletar (sem relatórios)

**Managers**:
- `FolderManager.root_folders(company)`: Pastas raiz (parent=None)

**Testes**: 12 testes incluindo hierarquia

### 4.2 Views

**URLs**: `/folders/`

**Views**:
- `FolderTreeView` (GET): Exibe árvore hierárquica
- `FolderCreateView` (GET/POST): Cria pasta
- `FolderUpdateView` (GET/POST): Renomeia pasta
- `FolderDeleteView` (POST): Deleta se vazia
- `FolderMoveView` (POST): Move pasta

**AJAX**:
- `folder_tree_json` (GET): Retorna JSON da árvore (para jsTree)

### 4.3 Templates

**Template**: `folders/tree.html`

**Usa**: jsTree jQuery plugin para exibir hierarquia

**Features**:
- Drag & drop para mover pastas/relatórios
- Context menu (renomear, deletar, nova subpasta)
- Ícones coloridos por tipo

### 4.4 Validações

**Regras**:
- Não pode criar ciclo (pasta filho da própria descendente)
- Não pode deletar pasta com relatórios
- Não pode deletar pasta com subpastas
- Limite de profundidade (ex: 10 níveis)

### Checklist de Conclusão

- [ ] Model Folder criado e testado (12 testes)
- [ ] Métodos de hierarquia implementados
- [ ] Views CRUD implementadas
- [ ] View folder_tree_json (AJAX)
- [ ] Template tree.html com jsTree
- [ ] Validações de ciclo e deleção
- [ ] Forms criados
- [ ] URLs configuradas
- [ ] Admin com hierarquia (django-mptt ou custom)
- [ ] Testes de integração
- [ ] Git commit: "feat(folders): implementa sistema hierárquico de pastas"

**Testes de Aceitação**:
```bash
# Criar pasta raiz
# Criar subpasta
# Criar subpasta da subpasta (3 níveis)
# Mover pasta
# Renomear pasta
# Tentar deletar pasta com relatórios (deve negar)
# Deletar pasta vazia (deve funcionar)
```

---

## Fase 5: CRUD de Relatórios

**Status**: ⏳ Aguardando Fase 4
**Duração Estimada**: 4-5 dias
**Complexidade**: Média-Alta
**Dependências**: Fase 4 completa

### Objetivo

Implementar criação, edição, listagem e exclusão de relatórios SQL salvos.

### 5.1 Model: Report

**Arquivo**: `apps/reports/models.py`

**Campos**:
- `report_id` (PK, AutoField)
- `company` (FK to Company, CASCADE)
- `connection` (FK to DatabaseConnection, PROTECT)
- `folder` (FK to Folder, NULL, SET_NULL)
- `created_by` (FK to User, PROTECT)
- `report_name` (CharField, max=200)
- `description` (TextField, optional)
- `sql_query` (TextField) - Query SQL
- `active` (BooleanField, default=True)
- `created_at`, `updated_at`

**Constraints**:
- `unique_together = [['company', 'folder', 'report_name']]`

**Métodos**:
- `validate_sql()`: Valida sintaxe e segurança
- `execute(user, filters)`: Executa relatório
- `duplicate()`: Cria cópia
- `move_to_folder(folder)`: Move para outra pasta

**Testes**: 15 testes

### 5.2 Service: SQLValidator

**Arquivo**: `apps/reports/services/sql_validator.py`

**Classe**: `SQLValidator`

**Métodos**:
- `validate(query)`: Valida query
  - Verifica sintaxe básica
  - Bloqueia comandos perigosos (DROP, DELETE, etc)
  - Valida placeholders de filtros
  - Retorna (is_valid, errors)

**Regras**:
- Apenas SELECT permitido
- Bloquear: DROP, DELETE, UPDATE, INSERT, ALTER, CREATE, TRUNCATE
- Permitir comentários SQL (-- e /* */)
- Validar placeholders: @parametro

**Testes**: 10 testes

### 5.3 Views CRUD

**URLs**: `/reports/`

**Views**:
- `ReportListView` (GET): Lista por pasta
- `ReportCreateView` (GET/POST): Cria relatório
- `ReportUpdateView` (GET/POST): Edita relatório
- `ReportDeleteView` (POST): Soft delete
- `ReportDuplicateView` (POST): Duplica relatório
- `ReportMoveView` (POST): Move para outra pasta
- `ReportPreviewView` (POST/AJAX): Preview dos dados

**Permissões**:
- Criar/Editar/Deletar: `@admin_required`
- Visualizar/Executar: `@require_tenant`

### 5.4 Forms

**Form**: `ReportForm`

**Campos**:
- report_name (required)
- description (textarea, optional)
- connection (select, apenas da empresa)
- folder (select, apenas da empresa)
- sql_query (textarea com SQL editor)

**JavaScript**: Integrar Monaco Editor ou CodeMirror para SQL

**Validações**:
- sql_query não vazio
- Validar SQL via SQLValidator
- Connection ativa
- Folder da mesma empresa

### 5.5 Templates

**Templates**:
- `reports/list.html`: Lista com filtros e busca
- `reports/form.html`: Formulário com SQL editor
- `reports/detail.html`: Visualizar relatório

**Features**:
- SQL syntax highlighting
- Validação em tempo real
- Autocomplete de tabelas (futuro)
- Preview de dados

### 5.6 Adaptar Dashboard Existente

**View**: `reports/views.py → dashboard()`

Adaptar para:
- Mostrar apenas relatórios da empresa
- Filtrar por pasta
- Buscar por nome
- Ordenar por nome/data

### Checklist de Conclusão

- [ ] Model Report criado e testado (15 testes)
- [ ] SQLValidator implementado e testado (10 testes)
- [ ] Views CRUD implementadas
- [ ] Forms criados e validados
- [ ] SQL Editor integrado (Monaco ou CodeMirror)
- [ ] Templates criados
- [ ] URLs configuradas
- [ ] Admin configurado
- [ ] Dashboard adaptado
- [ ] Testes de integração
- [ ] Git commit: "feat(reports): implementa CRUD de relatórios"

**Testes de Aceitação**:
```bash
# Criar relatório
# Editar relatório
# Validar SQL inválido (deve negar)
# Validar SQL com DROP (deve negar)
# Preview de dados
# Duplicar relatório
# Mover para outra pasta
# Deletar relatório
```

---

## Fase 6: Sistema de Filtros Parametrizados

**Status**: ⏳ Aguardando Fase 5
**Duração Estimada**: 5-6 dias
**Complexidade**: Alta
**Dependências**: Fase 5 completa

### Objetivo

Permitir relatórios com filtros dinâmicos (WHERE campo = @parametro).

### 6.1 Model: ReportFilter

**Arquivo**: `apps/reports/models.py`

**Campos**:
- `filter_id` (PK, AutoField)
- `report` (FK to Report, CASCADE)
- `filter_name` (CharField, max=100) - Nome técnico (@data_inicio)
- `display_name` (CharField, max=200) - Nome amigável
- `filter_type` (CharField, choices)
- `default_value` (CharField, optional)
- `required` (BooleanField, default=False)
- `order` (IntegerField) - Ordem de exibição

**Filter Types**:
- `text`: Texto livre
- `number`: Número inteiro
- `decimal`: Decimal
- `date`: Data única
- `date_range`: Intervalo de datas
- `select`: Lista de opções (JSON)
- `select_multiple`: Múltiplas opções
- `boolean`: Sim/Não

**Métodos**:
- `validate_value(value)`: Valida valor do filtro
- `format_value(value)`: Formata para SQL

**Testes**: 10 testes

### 6.2 Service: FilterEngine

**Arquivo**: `apps/reports/services/filter_engine.py`

**Classe**: `FilterEngine`

**Métodos**:
- `parse_placeholders(sql_query)`: Extrai @parametros do SQL
- `apply_filters(sql_query, filters_dict)`: Substitui placeholders
- `validate_filters(report, filters_dict)`: Valida filtros fornecidos

**Lógica de Substituição**:
```sql
-- Original
SELECT * FROM users WHERE created_at >= @data_inicio AND status = @status

-- Filtros aplicados
{"data_inicio": "2024-01-01", "status": "active"}

-- Resultado
SELECT * FROM users WHERE created_at >= '2024-01-01' AND status = 'active'
```

**Segurança**:
- Usar parametrização SQL (pyodbc placeholders)
- Escapar valores
- Validar tipos

**Testes**: 12 testes incluindo SQL injection

### 6.3 Views de Filtros

**URLs**: `/reports/<id>/filters/`

**Views**:
- `ReportFilterListView` (GET): Lista filtros do relatório
- `ReportFilterCreateView` (GET/POST): Cria filtro
- `ReportFilterUpdateView` (GET/POST): Edita filtro
- `ReportFilterDeleteView` (POST): Deleta filtro
- `ReportFilterReorderView` (POST): Reordena filtros

### 6.4 View de Execução com Filtros

**View**: `report_execute_with_filters(request, report_id)`

**Fluxo**:
1. GET: Exibe form com filtros do relatório
2. POST: Valida filtros, aplica ao SQL, executa query

**Template**: `reports/execute.html`

**Form Dinâmico**: Gera campos baseado em ReportFilter

### 6.5 Forms Dinâmicos

**Form**: `ReportExecutionForm`

**Construção Dinâmica**:
```python
def __init__(self, report, *args, **kwargs):
    super().__init__(*args, **kwargs)
    for filter in report.reportfilter_set.all():
        field = self._create_field_for_filter(filter)
        self.fields[filter.filter_name] = field
```

### 6.6 UI de Gestão de Filtros

**Interface**:
- Detectar @parametros no SQL automaticamente
- Sugerir criação de filtros
- Drag & drop para reordenar
- Preview de form antes de salvar

### Checklist de Conclusão

- [ ] Model ReportFilter criado e testado (10 testes)
- [ ] FilterEngine implementado e testado (12 testes)
- [ ] Views de gestão de filtros
- [ ] Form dinâmico de execução
- [ ] View execute_with_filters
- [ ] Templates criados
- [ ] UI de gestão de filtros
- [ ] Auto-detecção de @parametros
- [ ] Validação de SQL injection
- [ ] Testes de integração
- [ ] Git commit: "feat(reports): implementa filtros parametrizados"

**Testes de Aceitação**:
```bash
# Criar relatório com @data_inicio no SQL
# Criar filtro para @data_inicio (tipo date)
# Executar relatório
# Form deve exibir campo de data
# Preencher e executar
# Ver resultados filtrados
```

---

## Fase 7: Engine de Execução e Histórico

**Status**: ⏳ Aguardando Fase 6
**Duração Estimada**: 4-5 dias
**Complexidade**: Alta
**Dependências**: Fase 6 completa

### Objetivo

Registrar todas as execuções de relatórios em log completo com auditoria.

### 7.1 Model: ReportExecution

**Arquivo**: `apps/exports/models.py`

**Campos**:
- `execution_id` (PK, AutoField)
- `report` (FK to Report, CASCADE)
- `user` (FK to User, CASCADE)
- `filters_applied` (JSONField) - Filtros usados
- `execution_status` (CharField, choices)
- `rows_returned` (IntegerField, null)
- `execution_time_ms` (IntegerField, null)
- `error_message` (TextField, null)
- `executed_at` (DateTimeField, auto_now_add)

**Status Choices**:
- `pending`: Iniciando
- `running`: Executando
- `success`: Sucesso
- `error`: Erro
- `timeout`: Timeout

**Métodos**:
- `get_duration_display()`: Retorna tempo formatado
- `can_retry()`: Se pode re-executar

**Testes**: 8 testes

### 7.2 Service: ExecutionEngine

**Arquivo**: `apps/reports/services/execution_engine.py`

**Classe**: `ExecutionEngine`

**Método Principal**: `execute(report, filters, user)`

**Fluxo**:
```python
def execute(self, report, filters, user):
    # 1. Criar ReportExecution (status=pending)
    execution = ReportExecution.objects.create(...)

    try:
        # 2. Validar filtros
        self.validate_filters(report, filters)

        # 3. Aplicar filtros ao SQL
        query = FilterEngine().apply_filters(report.sql_query, filters)

        # 4. Executar query (com timeout)
        start = time.time()
        results = self.execute_query(report.connection, query)
        duration = (time.time() - start) * 1000

        # 5. Atualizar execution (success)
        execution.execution_status = 'success'
        execution.rows_returned = len(results)
        execution.execution_time_ms = duration
        execution.save()

        return results, execution

    except TimeoutError:
        execution.execution_status = 'timeout'
        execution.save()
        raise
    except Exception as e:
        execution.execution_status = 'error'
        execution.error_message = str(e)
        execution.save()
        raise
```

**Features**:
- Timeout configurável (settings.QUERY_TIMEOUT_SECONDS)
- Retry automático em caso de falha temporária (opcional)
- Cache de resultados (opcional, Redis)
- Métricas de performance

**Testes**: 15 testes incluindo timeout e retry

### 7.3 Refatorar View de Execução

**View**: `apps/reports/views.py → execute_query()`

Refatorar para usar `ExecutionEngine`:

```python
@require_tenant
def execute_report(request, report_id):
    report = get_object_or_404(Report, report_id=report_id, company=request.tenant)

    if request.method == 'POST':
        form = ReportExecutionForm(report, request.POST)
        if form.is_valid():
            filters = form.cleaned_data

            try:
                engine = ExecutionEngine()
                results, execution = engine.execute(report, filters, request.user)

                context = {
                    'report': report,
                    'results': results,
                    'execution': execution,
                }
                return render(request, 'reports/results.html', context)

            except Exception as e:
                messages.error(request, f'Erro ao executar: {str(e)}')

    else:
        form = ReportExecutionForm(report)

    return render(request, 'reports/execute.html', {'form': form, 'report': report})
```

### 7.4 Views de Histórico

**URLs**: `/reports/<id>/executions/`

**Views**:
- `ReportExecutionListView` (GET): Histórico de execuções
- `ReportExecutionDetailView` (GET): Detalhe da execução
- `ReportExecutionRetryView` (POST): Re-executar com mesmos filtros

**Template**: `reports/execution_history.html`

**Exibe**:
- Data/hora
- Usuário
- Filtros aplicados
- Status (success/error)
- Tempo de execução
- Linhas retornadas
- Botão "Re-executar"

### 7.5 Dashboard de Métricas

**Widget no Dashboard**:
- Total de execuções (hoje, semana, mês)
- Tempo médio de execução
- Taxa de erro
- Relatórios mais executados

### Checklist de Conclusão

- [ ] Model ReportExecution criado e testado (8 testes)
- [ ] ExecutionEngine implementado e testado (15 testes)
- [ ] View execute_report refatorada
- [ ] Views de histórico implementadas
- [ ] Templates de histórico criados
- [ ] Timeout configurado e funcionando
- [ ] Retry implementado (opcional)
- [ ] Dashboard com métricas
- [ ] Testes de integração
- [ ] Git commit: "feat(reports): implementa engine de execução e histórico"

**Testes de Aceitação**:
```bash
# Executar relatório
# Ver no histórico
# Ver detalhes da execução (filtros, tempo, linhas)
# Re-executar com mesmos filtros
# Executar relatório que dá erro
# Ver erro no histórico
```

---

## Fase 8: Exportação Multi-formato

**Status**: ⏳ Aguardando Fase 7
**Duração Estimada**: 3-4 dias
**Complexidade**: Média
**Dependências**: Fase 7 completa

### Objetivo

Suportar exportação de resultados em Excel, CSV e PDF com log completo.

### 8.1 Model: ReportExport

**Arquivo**: `apps/exports/models.py`

**Campos**:
- `export_id` (PK, AutoField)
- `execution` (FK to ReportExecution, CASCADE)
- `user` (FK to User, CASCADE)
- `export_format` (CharField, choices: excel, csv, pdf)
- `file_path` (CharField) - Caminho relativo em MEDIA_ROOT
- `file_size_bytes` (BigIntegerField)
- `exported_at` (DateTimeField, auto_now_add)

**Métodos**:
- `get_file_size_display()`: Retorna tamanho formatado (KB, MB)
- `get_download_url()`: URL para download
- `delete_file()`: Remove arquivo do disco

**Testes**: 6 testes

### 8.2 Base Exporter

**Arquivo**: `apps/exports/services/base_exporter.py`

**Classe Abstrata**: `BaseExporter`

```python
class BaseExporter(ABC):
    def __init__(self, execution, user):
        self.execution = execution
        self.user = user

    @abstractmethod
    def export(self, data, filename):
        """
        Exporta dados para arquivo.
        Returns: file_path
        """
        pass

    def save_export_record(self, file_path, format):
        """Cria ReportExport no banco"""
        file_size = os.path.getsize(file_path)
        return ReportExport.objects.create(
            execution=self.execution,
            user=self.user,
            export_format=format,
            file_path=file_path,
            file_size_bytes=file_size
        )
```

### 8.3 Excel Exporter

**Arquivo**: `apps/exports/services/excel_exporter.py`

**Classe**: `ExcelExporter(BaseExporter)`

**Usa**: openpyxl (já existe no MVP)

**Features**:
- Formatação de headers (bold, cor de fundo)
- Auto-size de colunas
- Freeze panes (primeira linha)
- Filtros automáticos
- Formatação de datas e números

**Migrar código existente** de `reports/views.py → download_excel()`

### 8.4 CSV Exporter

**Arquivo**: `apps/exports/services/csv_exporter.py`

**Classe**: `CSVExporter(BaseExporter)`

**Usa**: CSV padrão Python

**Features**:
- Encoding UTF-8 com BOM (Excel compatível)
- Delimiter configurável (vírgula ou ponto-e-vírgula)
- Quoting correto

### 8.5 PDF Exporter

**Arquivo**: `apps/exports/services/pdf_exporter.py`

**Classe**: `PDFExporter(BaseExporter)`

**Usa**: reportlab

**Features**:
- Cabeçalho com nome do relatório
- Tabela de dados
- Paginação automática
- Rodapé com timestamp e usuário
- Limite de 10.000 registros (PDF fica grande demais)

**Adicionar em requirements**: `reportlab==4.0.9`

### 8.6 View de Download

**View**: `download_export(request, export_id)`

**Fluxo**:
1. Verificar permissão (user = dono ou admin)
2. Pegar ReportExport
3. Verificar se arquivo existe
4. Retornar FileResponse com headers corretos

**Security**:
- Verificar que export pertence à empresa do usuário
- Não expor path completo
- Usar sendfile para performance (nginx X-Accel)

### 8.7 Cleanup Automático

**Management Command**: `cleanup_old_exports`

```bash
python manage.py cleanup_old_exports --days=30
```

**Deleta**:
- Arquivos com mais de N dias (settings.EXPORT_RETENTION_DAYS)
- ReportExport órfãos (sem arquivo no disco)

**Agendar**: Usar cron ou Celery beat (futuro)

### 8.8 Refatorar View Download Excel

**View**: `reports/views.py → download_excel()`

Refatorar para usar novo sistema:

```python
@require_tenant
def export_report(request, execution_id, format='excel'):
    execution = get_object_or_404(ReportExecution, execution_id=execution_id)

    # Verificar permissão
    if execution.report.company != request.tenant:
        raise PermissionDenied

    # Pegar dados da execução (re-executar ou usar cache)
    data = execution.get_results()  # TODO: implementar cache

    # Escolher exporter
    exporters = {
        'excel': ExcelExporter,
        'csv': CSVExporter,
        'pdf': PDFExporter,
    }

    exporter_class = exporters.get(format, ExcelExporter)
    exporter = exporter_class(execution, request.user)

    # Exportar
    filename = f"{execution.report.report_name}_{execution.execution_id}"
    file_path = exporter.export(data, filename)

    # Salvar registro
    export_record = exporter.save_export_record(file_path, format)

    # Redirecionar para download
    return redirect('exports:download', export_id=export_record.export_id)
```

### Checklist de Conclusão

- [ ] Model ReportExport criado e testado (6 testes)
- [ ] BaseExporter criado
- [ ] ExcelExporter implementado e testado
- [ ] CSVExporter implementado e testado
- [ ] PDFExporter implementado e testado
- [ ] reportlab adicionado em requirements
- [ ] View download_export implementada
- [ ] View export_report refatorada
- [ ] Management command cleanup_old_exports
- [ ] Storage configurado (MEDIA_ROOT/exports/)
- [ ] Testes de integração
- [ ] Git commit: "feat(exports): implementa exportação multi-formato"

**Testes de Aceitação**:
```bash
# Executar relatório
# Clicar em "Baixar Excel"
# Verificar arquivo
# Clicar em "Baixar CSV"
# Clicar em "Baixar PDF"
# Ver histórico de exports
# Rodar cleanup_old_exports
```

---

## Fase 9: Dashboard e Analytics

**Status**: ⏳ Aguardando Fase 8
**Duração Estimada**: 5-6 dias
**Complexidade**: Média-Alta
**Dependências**: Fase 8 completa

### Objetivo

Dashboard com métricas e analytics do uso de relatórios.

### 9.1 Métricas a Calcular

**Models/Managers**:

```python
# apps/reports/managers.py
class ReportExecutionManager(models.Manager):
    def stats_for_company(self, company, period='month'):
        """Retorna estatísticas de execuções"""
        # Total execuções
        # Taxa de sucesso
        # Tempo médio
        # Top 10 relatórios mais executados
        # Top 10 usuários mais ativos
        pass
```

**Métricas**:
- Total de relatórios (ativos)
- Total de execuções (hoje, semana, mês)
- Tempo médio de execução
- Taxa de sucesso (%)
- Taxa de erro (%)
- Relatórios mais executados (top 10)
- Usuários mais ativos (top 10)
- Conexões mais usadas
- Distribuição por dia da semana
- Distribuição por hora do dia

### 9.2 Views de Dashboard

**View**: `dashboard(request)` - Refatorar completamente

**Template**: `reports/dashboard.html`

**Tabs**:
1. **Visão Geral**: Cards com métricas principais
2. **Relatórios**: Lista com quick actions
3. **Histórico**: Execuções recentes
4. **Analytics**: Gráficos

**Context**:
```python
{
    'stats': {
        'total_reports': 42,
        'executions_today': 15,
        'executions_week': 87,
        'executions_month': 356,
        'avg_execution_time': 2.3,  # segundos
        'success_rate': 98.5,  # %
        'error_rate': 1.5,  # %
    },
    'top_reports': [...],
    'top_users': [...],
    'recent_executions': [...],
}
```

### 9.3 Gráficos

**Usar**: Chart.js

**Gráficos**:
1. **Execuções por Dia** (últimos 30 dias) - Line chart
2. **Taxa de Sucesso vs Erro** - Pie chart
3. **Top 10 Relatórios** - Bar chart horizontal
4. **Distribuição por Hora** - Bar chart
5. **Tempo de Execução** - Box plot (opcional)

**Endpoints AJAX**:
- `/api/stats/executions-by-day/`
- `/api/stats/success-rate/`
- `/api/stats/top-reports/`
- `/api/stats/hourly-distribution/`

### 9.4 Dashboard Admin (Super Admin)

**View**: `admin_dashboard(request)` - Cross-company

**Permissão**: `@super_admin_required`

**Métricas**:
- Total de empresas ativas
- Total de usuários ativos
- Total de relatórios (todas empresas)
- Total de execuções (todas empresas)
- Empresas mais ativas
- Relatórios mais usados (cross-company)
- Estatísticas de storage (espaço usado por exports)

**Template**: `reports/admin_dashboard.html`

### 9.5 Widgets Reutilizáveis

**Criar components**:
- `{% include 'components/stat_card.html' with title="Total" value=42 %}`
- `{% include 'components/chart_line.html' with data=... %}`
- `{% include 'components/top_list.html' with items=... %}`

### 9.6 Real-time Updates (Opcional)

**Usar**: Django Channels + WebSocket

**Features**:
- Atualizar contador de execuções em tempo real
- Notificações quando relatório termina de executar
- Status "running" atualiza sozinho

**Adicionar**: `channels`, `daphne` em requirements

### 9.7 Export de Dashboard

**Botão**: "Exportar Dashboard (PDF)"

**Gera**: PDF com snapshot das métricas e gráficos

**Usa**: PDFExporter + Chart.js headless rendering

### Checklist de Conclusão

- [ ] ReportExecutionManager com métodos de stats
- [ ] View dashboard refatorada
- [ ] Template dashboard.html redesenhado
- [ ] Chart.js integrado
- [ ] Gráficos implementados (5 tipos)
- [ ] Endpoints AJAX de stats
- [ ] View admin_dashboard (super_admin)
- [ ] Widgets reutilizáveis criados
- [ ] Real-time updates (opcional)
- [ ] Export de dashboard (opcional)
- [ ] Testes de views
- [ ] Git commit: "feat(reports): implementa dashboard e analytics"

**Testes de Aceitação**:
```bash
# Acessar /
# Ver métricas
# Ver gráficos carregando
# Clicar em relatório rápido
# Ver top 10 relatórios
# Acessar como super_admin
# Ver dashboard admin com todas empresas
```

---

## 🔄 Fases Futuras (Pós-MVP Completo)

### Fase 10: API REST (Opcional)

**Duração**: 4-5 dias
**Complexidade**: Média

**Features**:
- Django REST Framework
- Endpoints para CRUD de relatórios
- Endpoint de execução de relatórios
- Autenticação via Token/JWT
- Rate limiting
- Documentação OpenAPI (Swagger)
- Webhooks para notificações

**Use Cases**:
- Integração com sistemas externos
- Mobile app
- Relatórios em dashboards de BI

### Fase 11: Agendamento (Opcional)

**Duração**: 5-6 dias
**Complexidade**: Alta

**Features**:
- Celery + Redis/RabbitMQ
- Agendar execuções periódicas (cron-like)
- Envio de resultados por e-mail
- Notificações push/Slack
- Histórico de agendamentos

**Models**:
- `ScheduledReport`: Relatório + cron expression
- `ScheduledExecution`: Execuções agendadas

### Fase 12: Features Avançadas (Opcional)

**Duração**: 8-10 dias
**Complexidade**: Alta

**Features**:
- **Versionamento de Relatórios**: Git-like, histórico de mudanças
- **Workflow de Aprovação**: Relatórios precisam aprovação antes de publicar
- **Auditoria Completa**: Quem alterou o quê, quando
- **Relatórios Públicos**: Compartilhar via link público (sem login)
- **Embeds**: Iframe para embedar relatórios em sites
- **Favoritos**: Usuário marca relatórios favoritos
- **Tags**: Categorizar relatórios com tags
- **Comentários**: Usuários comentam em relatórios
- **Notificações**: Sistema de notificações in-app

### Fase 13: Múltiplos SGBDs (Opcional)

**Duração**: 6-8 dias
**Complexidade**: Alta

**Adicionar Suporte**:
- PostgreSQL
- MySQL
- Oracle
- MongoDB (NoSQL)

**Desafios**:
- Dialetos SQL diferentes
- Drivers diferentes
- Validação específica por banco

### Fase 14: Deploy e DevOps

**Duração**: 3-5 dias
**Complexidade**: Média

**Tasks**:
- Dockerização
- Docker Compose para dev
- CI/CD (GitHub Actions)
- Deploy em produção (AWS/Azure/DigitalOcean)
- Configurar PostgreSQL
- Configurar Nginx + Gunicorn
- SSL/HTTPS
- Backup automatizado
- Monitoring (Sentry, Prometheus)

---

## 📈 Métricas de Progresso

| Fase | Status | Progresso | Testes | Docs | Commits |
|------|--------|-----------|--------|------|---------|
| 0 - Preparação | 🔜 | 0% | - | - | - |
| 1 - Autenticação | ⏳ | 0% | 0/32 | - | - |
| 2 - Multi-tenancy | ⏳ | 0% | 0/22 | - | - |
| 3 - Conexões | ⏳ | 0% | 0/25 | - | - |
| 4 - Pastas | ⏳ | 0% | 0/12 | - | - |
| 5 - Relatórios | ⏳ | 0% | 0/25 | - | - |
| 6 - Filtros | ⏳ | 0% | 0/22 | - | - |
| 7 - Execução | ⏳ | 0% | 0/23 | - | - |
| 8 - Exportação | ⏳ | 0% | 0/15 | - | - |
| 9 - Dashboard | ⏳ | 0% | 0/10 | - | - |
| **TOTAL** | | **0%** | **0/186** | | |

**Legenda**:
- 🔜 Próxima
- ⏳ Aguardando
- 🔄 Em Progresso
- ✅ Completa

---

## 🎯 Critérios de Qualidade

Para cada fase ser considerada **completa**, deve atender:

### Código
- [ ] Todos os models criados e documentados com docstrings
- [ ] Todos os campos com help_text
- [ ] Type hints em todas as funções
- [ ] Validações implementadas
- [ ] Error handling adequado

### Testes
- [ ] Cobertura mínima de 80%
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Fixtures criadas e documentadas

### Django
- [ ] Migrations criadas e aplicadas
- [ ] Admin configurado
- [ ] URLs configuradas
- [ ] Templates criados e responsivos

### Documentação
- [ ] Docstrings em todos os models/views/services
- [ ] README atualizado (se necessário)
- [ ] ROADMAP.md atualizado (marcar fase completa)

### Code Review
- [ ] Código segue PEP 8
- [ ] Sem código comentado
- [ ] Sem imports não utilizados
- [ ] Sem print() statements (usar logging)

### Segurança
- [ ] Inputs validados
- [ ] SQL injection prevenido
- [ ] XSS prevenido
- [ ] CSRF tokens usados
- [ ] Permissões verificadas

### Deploy
- [ ] Funciona em ambiente de staging
- [ ] Performance aceitável
- [ ] Sem warnings do Django
- [ ] Pronto para produção

---

## 📝 Convenções do Projeto

### Nomenclatura

**Models**:
- PascalCase singular: `Company`, `Report`, `UserRole`
- Tabela no plural: `db_table = 'companies'`

**Views**:
- snake_case descritivo: `create_report`, `list_reports`, `execute_with_filters`

**URLs**:
- kebab-case: `create-report/`, `list-reports/`, `execute-with-filters/`

**Variáveis**:
- snake_case: `user_company_role`, `execution_time_ms`

**Constantes**:
- UPPER_SNAKE_CASE: `MAX_QUERY_RESULTS`, `QUERY_TIMEOUT_SECONDS`

**Apps**:
- plural: `companies`, `reports`, `connections`

### Commits

**Formato**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: Nova feature
- `fix`: Bug fix
- `refactor`: Refatoração sem mudança de comportamento
- `test`: Adicionar/modificar testes
- `docs`: Documentação
- `style`: Formatação (não muda código)
- `chore`: Tarefas de manutenção

**Exemplos**:
```bash
feat(companies): adiciona model Company

- Implementa model com validação de CNPJ
- Adiciona property total_users
- Cria testes unitários com 15 casos
- Configura admin com filters e actions

Refs: #123
```

```bash
fix(reports): corrige SQL injection em execute_query

- Usa parametrização ao invés de string formatting
- Adiciona testes de segurança
- Atualiza documentação

Refs: #456
```

### Branches

**Fluxo**:
- `main`: Produção (sempre estável)
- `develop`: Desenvolvimento (integração)
- `feature/<nome>`: Features (branch de develop)
- `fix/<nome>`: Bug fixes (branch de develop ou main)
- `hotfix/<nome>`: Hotfixes críticos (branch de main)

**Exemplo**:
```bash
git checkout develop
git checkout -b feature/implementar-filtros-parametrizados
# ... desenvolver ...
git add .
git commit -m "feat(reports): implementa filtros parametrizados"
git push origin feature/implementar-filtros-parametrizados
# Abrir PR para develop
```

### Imports

**Ordem**:
```python
# 1. Standard library
import os
import sys
from datetime import datetime

# 2. Third-party
import pandas as pd
from django.db import models
from django.shortcuts import render

# 3. Local
from apps.companies.models import Company
from apps.core.utils import format_cnpj
```

### Docstrings

**Formato**: Google Style

**Model**:
```python
class Company(models.Model):
    """
    Representa uma empresa no sistema multi-tenant.

    Cada empresa possui usuários, conexões e relatórios isolados.

    Attributes:
        company_id (int): ID único da empresa
        company_name (str): Nome completo
        cnpj (str): CNPJ formatado

    Examples:
        >>> company = Company.objects.create(
        ...     company_name="Acme",
        ...     cnpj="12.345.678/0001-90"
        ... )
    """
```

**Function**:
```python
def execute_report(report, filters, user):
    """
    Executa relatório aplicando filtros.

    Args:
        report (Report): Relatório a executar
        filters (dict): Filtros a aplicar
        user (User): Usuário executando

    Returns:
        tuple: (results, execution)
            results (pd.DataFrame): Dados retornados
            execution (ReportExecution): Registro de execução

    Raises:
        ValidationError: Se filtros inválidos
        TimeoutError: Se query excede timeout

    Examples:
        >>> filters = {'data_inicio': '2024-01-01'}
        >>> results, exec = execute_report(report, filters, user)
        >>> print(len(results))
        150
    """
```

---

## 🚀 Quick Start para IA

Este guia é para a IA (Claude Code) implementar cada fase.

### Fluxo de Trabalho

1. **Ler especificação da fase**
   - Ler seção completa no ROADMAP.md
   - Entender objetivo, models, views, testes

2. **Criar models primeiro**
   ```bash
   # Editar apps/app_name/models.py
   # Seguir exatamente a especificação
   ```

3. **Criar migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Criar testes**
   ```bash
   # Editar apps/app_name/tests/test_models.py
   # Implementar TODOS os testes listados
   ```

5. **Rodar testes**
   ```bash
   pytest apps/app_name/tests/test_models.py -v
   ```

6. **Implementar views**
   ```bash
   # Editar apps/app_name/views.py
   ```

7. **Criar templates**
   ```bash
   # Criar templates/app_name/*.html
   ```

8. **Configurar URLs**
   ```bash
   # Editar apps/app_name/urls.py
   # Editar config/urls.py
   ```

9. **Configurar admin**
   ```bash
   # Editar apps/app_name/admin.py
   ```

10. **Rodar todos os testes**
    ```bash
    pytest apps/app_name/tests/ -v
    pytest --cov=apps.app_name
    ```

11. **Verificar coverage**
    ```bash
    # Deve ser >= 80%
    ```

12. **Fazer commit**
    ```bash
    git add .
    git commit -m "feat(app): implementa feature X"
    ```

13. **Atualizar ROADMAP**
    - Marcar checklist items como completos
    - Atualizar tabela de progresso

### Checklist por Implementação

Antes de considerar uma tarefa completa, verificar:

- [ ] Código escrito e funcionando
- [ ] Docstrings completas
- [ ] Type hints adicionados
- [ ] Testes escritos (TODOS os casos)
- [ ] Testes passando (100%)
- [ ] Coverage >= 80%
- [ ] Admin configurado
- [ ] URLs configuradas
- [ ] Templates criados (se aplicável)
- [ ] Migrations aplicadas
- [ ] Sem warnings do Django
- [ ] `python manage.py check` passa
- [ ] Servidor roda sem erros
- [ ] Commit feito
- [ ] ROADMAP atualizado

### Padrões de Segurança

Em cada implementação, verificar:

- [ ] **SQL Injection**: Usar parametrização, nunca string formatting
- [ ] **XSS**: Escape de HTML nos templates (Django faz automático)
- [ ] **CSRF**: Token CSRF em todos os forms
- [ ] **Autenticação**: `@login_required` em views que precisam
- [ ] **Autorização**: `@require_tenant`, `@require_role` onde aplicável
- [ ] **Validação**: Validar todos os inputs do usuário
- [ ] **Sanitização**: Limpar dados antes de salvar
- [ ] **Logs**: Não logar informações sensíveis (senhas, tokens)
- [ ] **Permissões**: Verificar que usuário tem acesso ao recurso

### Quando Pedir Clarificação

Perguntar ao usuário se:
- Especificação ambígua ou incompleta
- Múltiplas interpretações possíveis
- Decisão de design não está clara
- Trade-off entre performance e simplicidade
- Incerteza sobre requisito de negócio

### Exemplo de Implementação Completa

**Task**: Implementar Model Company (Fase 1.1)

**Passo 1**: Ler especificação
```
- Ler seção "1.1 Model: Company" no ROADMAP
- Entender campos, validações, métodos
```

**Passo 2**: Criar model
```python
# apps/companies/models.py
from django.db import models
from django.core.validators import RegexValidator
# ... código completo conforme ROADMAP
```

**Passo 3**: Criar migration
```bash
python manage.py makemigrations companies
python manage.py migrate
```

**Passo 4**: Criar testes
```python
# apps/companies/tests/test_models.py
import pytest
# ... todos os 15 testes listados
```

**Passo 5**: Rodar testes
```bash
pytest apps/companies/tests/test_models.py -v
# Verificar que todos passam
```

**Passo 6**: Configurar admin
```python
# apps/companies/admin.py
from django.contrib import admin
# ... conforme especificação
```

**Passo 7**: Commit
```bash
git add apps/companies/
git commit -m "feat(companies): implementa model Company

- Cria model com validação CNPJ
- Adiciona properties (total_users, total_connections, total_reports)
- Implementa métodos activate/deactivate
- Cria 15 testes unitários (100% passing)
- Configura admin com filtros e actions

Refs: ROADMAP.md Fase 1.1"
```

---

## 📚 Recursos Adicionais

### Documentação

- [Django 5.0 Docs](https://docs.djangoproject.com/en/5.0/)
- [Django Best Practices](https://django-best-practices.readthedocs.io/)
- [Two Scoops of Django](https://www.feldroy.com/books/two-scoops-of-django-3-x)
- [pytest-django](https://pytest-django.readthedocs.io/)
- [Django REST Framework](https://www.django-rest-framework.org/) (Fase 10)

### Ferramentas

- [DB Browser for SQLite](https://sqlitebrowser.org/) - Visualizar db.sqlite3
- [Postman](https://www.postman.com/) - Testar APIs (Fase 10)
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL (produção)

### Referências de Schema

- `forgereports_schema.html`: Diagrama ER completo (na raiz do projeto)
- `forge-reports-standalone/`: UI mockups de referência

---

**Última atualização**: 2025-01-12
**Versão do Roadmap**: 1.0
**Mantido por**: Equipe ForgeReports / Claude Code

---

## 🎉 Conclusão

Este roadmap detalha a evolução do ForgeReports de um MVP simples para um sistema enterprise completo em **9 fases principais**.

**Tempo total estimado**: 30-40 dias de desenvolvimento

**Ao completar todas as fases, teremos**:
- ✅ Sistema multi-tenant robusto
- ✅ 10 models relacionados
- ✅ 186+ testes automatizados
- ✅ Interface moderna e responsiva
- ✅ Auditoria completa
- ✅ Exportação multi-formato
- ✅ Dashboard com analytics
- ✅ Sistema pronto para produção

**Próximo passo**: Iniciar [Fase 0: Preparação e Arquitetura Base](#fase-0-preparação-e-arquitetura-base)
