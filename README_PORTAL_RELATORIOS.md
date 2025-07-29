# 📊 ForgeReports - MVP Melhorado

Projeto interno desenvolvido pela CodeForge Systems para visualização dinâmica e segura de relatórios com base em queries SQL.

Este é um projeto web construído com **Django**, **Python** e **HTML**, que tem como objetivo fornecer um portal para **visualização de relatórios técnicos** de forma segura, personalizável e escalável.

## 🔧 Tecnologias utilizadas

### MVP (Versão Inicial)
- **Backend**: Python 3.x + Django 4.x
- **Banco do Sistema**: SQLite (desenvolvimento) → PostgreSQL (produção futura)
- **Conexões Externas**: SQL Server (via pyodbc)
- **Frontend**: HTML5 + Bootstrap 4.5 + Tailwind CSS
- **Sem Redis**: Não utilizaremos cache em memória no MVP

### Futuras Expansões
- PostgreSQL, MySQL, Oracle para conexões externas
- Outros drivers de banco conforme necessidade

---

## 🧑‍💻 Perfis de Acesso

### Técnico
- **Visualização Híbrida**: Pode alternar entre "Modo Técnico" e "Modo Usuário"
- Acesso ao painel de administração completo
- Cadastro e edição de relatórios
- Criação de filtros dinâmicos (texto, select, data)
- Definição de usuários com permissão de visualização
- Organização dos relatórios por categorias no menu lateral
- Cadastro de conexões com bancos de dados externos

### Usuário
- Acesso apenas ao painel de visualização
- Visualização de relatórios permitidos
- Aplicação de filtros definidos pelo técnico
- Exportação para Excel

---

## 🗂️ Funcionalidades

### 📁 Módulo: Gerenciamento de Relatórios (Técnico)
- Criar relatório (nome, descrição, query SQL)
- Três tipos de filtros disponíveis:
  - **Filtro de Texto**: Campos de entrada livre
  - **Filtro de Select**: Lista de opções predefinidas
  - **Filtro de Data**: Seletor de datas (intervalo ou data única)
- Relacionar relatório a uma conexão de banco previamente cadastrada
- Organizar relatórios em categorias no menu lateral
- Definir permissões de visualização por usuário
- **Alternância de Visualização**: Botão para alternar entre "Modo Técnico" e "Modo Usuário"

### 🔗 Módulo: Conexão com Banco de Dados
- Cadastro de conexões externas para SQL Server
- Teste de conexão no momento do cadastro
- Armazenamento seguro de credenciais
- **Arquitetura Preparada**: Estrutura pronta para adicionar outros SGBDs futuramente

### 🔐 Módulo: Autenticação
- **Login único** para todos os usuários
- Permissões baseadas em grupos do Django (Técnicos/Usuários)
- **Visualizações distintas** baseadas no perfil do usuário logado
- Técnicos têm acesso completo + botão para "Ver como Usuário"
- Usuários têm acesso apenas à visualização de relatórios

### 📊 Módulo: Visualização de Relatórios (Usuário)
- **Estrutura de Pastas**: Navegação hierárquica com pastas e subpastas
- **Pesquisa de Relatórios**: Campo de busca para encontrar relatórios por nome/descrição
- Interface limpa para aplicação de filtros
- Execução e exibição de resultados com paginação
- Exportação para Excel (built-in no MVP)
- Preservação da ordem e nomes das colunas do SELECT original

---

## 🛠️ MVP - Roadmap Detalhado

### 🎯 **FASE 1: Setup e Estrutura Base** (1-2 semanas)

#### Backend
- [x] Criar projeto Django com SQLite
- [ ] Criar venv
- [ ] Configurar estrutura de apps: `core/`, `users/`, `reports/`, `connections/`
- [ ] Instalar dependências: `pyodbc`, `django-bootstrap4`, outros
- [ ] Configurar settings para desenvolvimento/produção
- [ ] Criar models básicos:
  - `User` (Django padrão + grupos)
  - `DatabaseConnection` (preparado para múltiplos tipos)
  - `Report` (básico)
  - `ReportFilter` (básico)

#### Frontend
- [ ] Instalar e configurar Tailwind CSS + Bootstrap
- [ ] Criar templates base: `base.html`, `sidebar.html`
- [ ] Estrutura de layouts responsivos
- [ ] Sistema de temas (técnico vs usuário)

---

### 🎯 **FASE 2: Autenticação e Perfis** (1 semana)

#### Backend
- [ ] Sistema de **login único** para todos os usuários
- [ ] Middleware para controle de acesso baseado em grupos
- [ ] Grupos: `Tecnicos` e `Usuarios`
- [ ] Views condicionais baseadas no perfil do usuário
- [ ] Decorators para controle de permissão por funcionalidade

#### Frontend
- [ ] Tela de login única e responsiva
- [ ] **Dashboard adaptativo**: Layout muda conforme o perfil
- [ ] **Para Técnicos**: Menu completo + botão "Ver como Usuário"
- [ ] **Para Usuários**: Menu simplificado focado em visualização
- [ ] Menu lateral dinâmico baseado em permissões

---

### 🎯 **FASE 3: Conexões com Banco** (1 semana)

#### Backend
- [ ] Model `DatabaseConnection` completo:
```python
class DatabaseConnection(models.Model):
    TIPOS_BANCO = [
        ('sqlserver', 'SQL Server'),
        ('postgresql', 'PostgreSQL'),
        ('mysql', 'MySQL'),
        ('oracle', 'Oracle'),
    ]
    nome = models.CharField(max_length=100)
    tipo_banco = models.CharField(max_length=20, choices=TIPOS_BANCO)
    servidor = models.CharField(max_length=200)
    banco = models.CharField(max_length=100)
    usuario = models.CharField(max_length=100)
    senha = models.CharField(max_length=200)  # Texto puro no MVP
    ativo = models.BooleanField(default=True)
```
- [ ] Função de conexão baseada no exemplo fornecido
- [ ] **Apenas SQL Server funcionará no MVP** - outros tipos retornarão erro informativo
- [ ] Service layer para teste de conexões
- [ ] CRUD completo para conexões

#### Frontend
- [ ] Formulário de cadastro de conexões
- [ ] Lista de conexões com status
- [ ] Botão "Testar Conexão" com feedback visual
- [ ] Interface de edição/exclusão

---

### 🎯 **FASE 4: Gestão de Relatórios** (2 semanas)

#### Backend
- [ ] Models completos:
```python
class ReportFolder(models.Model):
    nome = models.CharField(max_length=200)
    pasta_pai = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)
    criado_por = models.ForeignKey(User, on_delete=models.CASCADE)
    criado_em = models.DateTimeField(auto_now_add=True)

class Report(models.Model):
    nome = models.CharField(max_length=200)
    descricao = models.TextField()
    sql_query = models.TextField()
    conexao_banco = models.ForeignKey(DatabaseConnection, on_delete=models.CASCADE)
    pasta = models.ForeignKey(ReportFolder, null=True, blank=True, on_delete=models.SET_NULL)
    criado_por = models.ForeignKey(User, on_delete=models.CASCADE)
    usuarios_permitidos = models.ManyToManyField(User, related_name='reports_permitidos')

class ReportFilter(models.Model):
    TIPOS_FILTRO = [
        ('texto', 'Texto'),
        ('select', 'Lista de Opções'),
        ('data', 'Data'),
    ]
    relatorio = models.ForeignKey(Report, on_delete=models.CASCADE)
    nome = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPOS_FILTRO)
    opcoes_select = models.JSONField(null=True, blank=True)  # Para filtros select
    obrigatorio = models.BooleanField(default=False)
```
- [ ] Views para CRUD de relatórios
- [ ] **Sistema de pastas hierárquico** com navegação tipo árvore
- [ ] **Funcionalidade de pesquisa** por nome e descrição
- [ ] Gerenciamento de filtros por relatório
- [ ] **Sem validação de SQL no MVP** - executar direto

#### Frontend
- [ ] Formulário de criação de relatórios com editor SQL
- [ ] **Interface de pastas**: Criação, edição e navegação hierárquica
- [ ] **Campo de pesquisa** com busca em tempo real
- [ ] Interface para adicionar/remover filtros
- [ ] Seletor de usuários permitidos
- [ ] **Visualização em árvore** das pastas no sidebar
- [ ] Preview básico da query (opcional)

---

### 🎯 **FASE 5: Visualização e Execução** (2 semanas)

#### Backend
- [ ] Service para execução segura de queries SQL
- [ ] Sistema de paginação para grandes resultados
- [ ] Aplicação dinâmica de filtros nas queries
- [ ] **API de pesquisa** para buscar relatórios por nome/descrição
- [ ] **API de navegação** hierárquica de pastas
- [ ] Exportação para Excel usando `openpyxl`
- [ ] Views específicas para usuários vs técnicos

#### Frontend
- [ ] **Interface de navegação por pastas** (estilo explorador de arquivos)
- [ ] **Campo de pesquisa** com autocomplete e busca instantânea
- [ ] **Breadcrumb** para navegação nas pastas
- [ ] Interface de visualização de relatórios
- [ ] Formulário dinâmico de filtros baseado no tipo
- [ ] Tabela responsiva com paginação
- [ ] Botão de exportação Excel
- [ ] Loading states e feedback de erro
- [ ] **Modo Técnico**: Visualização com opções de edição + botão "Ver como Usuário"
- [ ] **Modo Usuário**: Navegação simples por pastas + pesquisa

---

### 🎯 **FASE 6: Refinamentos e Deploy** (1 semana)

#### Backend
- [ ] Logs básicos de execução
- [ ] Tratamento de erros SQL
- [ ] Otimizações de performance
- [ ] Configuração para PostgreSQL (produção)

#### Frontend
- [ ] Polish na UX/UI
- [ ] Responsividade completa
- [ ] Testes em diferentes dispositivos
- [ ] Documentação de usuário básica

---

## 🔗 Exemplo de Função de Conexão

```python
# connections/services.py
import pyodbc
import socket
from django.conf import settings

def get_database_connection(database_connection):
    """
    Conecta com bancos de dados baseado na configuração da DatabaseConnection
    MVP: Apenas SQL Server funcionará, outros tipos retornarão erro informativo
    """
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    
    if database_connection.tipo_banco == 'sqlserver':
        connection_string = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={database_connection.servidor};"
            f"DATABASE={database_connection.banco};"
            f"UID={database_connection.usuario};"
            f"PWD={database_connection.senha}"  # Texto puro no MVP
        )
        return pyodbc.connect(connection_string)
    
    elif database_connection.tipo_banco == 'postgresql':
        raise NotImplementedError("PostgreSQL será implementado na próxima versão")
    elif database_connection.tipo_banco == 'mysql':
        raise NotImplementedError("MySQL será implementado na próxima versão")
    elif database_connection.tipo_banco == 'oracle':
        raise NotImplementedError("Oracle será implementado na próxima versão")
    
    raise ValueError(f"Tipo de banco não suportado: {database_connection.tipo_banco}")
```

---

## 🗺️ Roadmap Pós-MVP

### **Expansão 1: Múltiplos SGBDs** (3-4 semanas)
- Suporte a PostgreSQL, MySQL, Oracle
- Adaptadores de conexão por tipo de banco
- Migração do sistema interno para PostgreSQL

### **Expansão 2: Validações e Segurança** (2-3 semanas)
- Parser e validador de queries SQL
- Sanitização avançada de inputs
- Logs detalhados de execução
- Rate limiting por usuário

### **Expansão 3: Features Avançadas** (4-6 semanas)
- Gráficos e visualizações
- Agendamento de relatórios
- Templates visuais
- Histórico de execuções
- Notificações por email

### **Expansão 4: Integrações** (3-4 semanas)
- LDAP/SSO
- API REST para integração externa
- Webhooks para notificações
- Backup automático de configurações

---

## 📌 Decisões Técnicas do MVP

### Por que SQLite → PostgreSQL?
- **MVP**: SQLite para simplicidade de desenvolvimento
- **Produção**: PostgreSQL para performance e recursos avançados

### Por que senhas em texto puro no MVP?
- Foco na funcionalidade core, não em segurança avançada
- Usuários internos confiáveis
- Criptografia será implementada na primeira expansão

### Por que mostrar outros tipos de banco sem funcionar?
- Interface preparada para expansão
- Feedback claro ao usuário sobre funcionalidades futuras
- Evita retrabalho no frontend quando implementar outros SGBDs

### Por que login único com visualizações diferentes?
- Simplicidade de manutenção
- Flexibilidade para técnicos alternarem contextos
- Melhor UX que múltiplos sistemas de login

### Por que sistema de pastas hierárquico?
- Organização intuitiva para usuários finais
- Escalabilidade para grandes volumes de relatórios
- Facilita a localização através de pesquisa

### Por que sem validação de SQL no MVP?
- Foco na funcionalidade core
- Usuários técnicos internos (confiança inicial)
- Implementação posterior com parser robusto

### Por que sem Redis?
- Adiciona complexidade desnecessária no MVP
- Cache pode ser implementado futuramente se necessário
- Django cache framework suficiente inicialmente

---

## 📬 Contato

Projeto desenvolvido pela CodeForge Systems.  
Email: contato@codeforgesystems.com.br  
GitHub: [link_do_repositório]