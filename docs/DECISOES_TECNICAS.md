# Decisões Técnicas

## Stack Definida

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Backend** | Django 4.2+ | MVP já funciona, excelente para dados |
| **API** | Django REST Framework | Endpoints JSON, serializers, auth |
| **ORM** | Django ORM | Integrado, migrations, multi-db |
| **Banco Sistema** | PostgreSQL | Multi-tenant, robusto |
| **Auth** | JWT (SimpleJWT) | Stateless, frontend separado |
| **Dados** | pandas | Manipulação, export Excel |
| **Conexões Externas** | pyodbc, psycopg2, pymysql | SQL Server, PostgreSQL, MySQL |
| **Frontend** | React + Vite | SPA moderna, rápida |
| **Estilo** | Tailwind CSS | Já usado no protótipo |
| **HTTP Client** | Axios | Comunicação com API |

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                         │
│                 React + Vite                        │
│                  :5173 (dev)                        │
└─────────────────────┬───────────────────────────────┘
                      │ API REST (JSON)
                      │ Authorization: Bearer <jwt>
                      ▼
┌─────────────────────────────────────────────────────┐
│                    Backend                          │
│              Django + DRF                           │
│                  :8000                              │
│  ┌─────────────────────────────────────────────────┐│
│  │  pandas  │  pyodbc  │  psycopg2  │  openpyxl   ││
│  └─────────────────────────────────────────────────┘│
└──────────┬──────────────────────────┬───────────────┘
           │                          │
           ▼                          ▼
      PostgreSQL              Bancos dos Clientes
      (sistema)               (SQL Server, PG, MySQL)
```

## Estrutura do Projeto

```
CForgeReports/
├── backend/                      # Django
│   ├── config/                   # Configurações Django
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── empresas/            # Multi-tenant
│   │   ├── usuarios/            # Auth, usuários
│   │   ├── conexoes/            # Conexões de banco
│   │   ├── relatorios/          # Relatórios, filtros
│   │   └── execucoes/           # Histórico
│   ├── core/                    # Utils compartilhados
│   │   ├── permissions.py
│   │   └── crypto.py
│   ├── services/                # Lógica de negócio
│   │   ├── database_connector.py
│   │   ├── query_executor.py
│   │   └── excel_exporter.py
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                     # React
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   └── features/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                         # Documentação
├── forgereports/                 # MVP (referência)
└── forge-reports-standalone/     # Protótipo UI (referência)
```

## Modelo de Dados (Django)

```python
# apps/empresas/models.py
class Empresa(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    nome = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    ativo = models.BooleanField(default=True)
    max_usuarios = models.IntegerField(default=10)
    max_conexoes = models.IntegerField(default=5)
    max_relatorios = models.IntegerField(default=50)
    criado_em = models.DateTimeField(auto_now_add=True)

# apps/usuarios/models.py
class Usuario(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    nome = models.CharField(max_length=255)
    email = models.EmailField()
    role = models.CharField(choices=ROLES, default='USUARIO')  # ADMIN, TECNICO, USUARIO
    ativo = models.BooleanField(default=True)

    class Meta:
        unique_together = ['empresa', 'email']

# apps/conexoes/models.py
class Conexao(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    nome = models.CharField(max_length=255)
    tipo = models.CharField(choices=TIPOS_BANCO)  # SQLSERVER, POSTGRESQL, MYSQL
    host = models.CharField(max_length=255)
    porta = models.IntegerField()
    database = models.CharField(max_length=255)
    usuario = models.CharField(max_length=255)
    senha_encriptada = models.TextField()
    ativo = models.BooleanField(default=True)

    class Meta:
        unique_together = ['empresa', 'nome']

# apps/relatorios/models.py
class Relatorio(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    conexao = models.ForeignKey(Conexao, on_delete=models.PROTECT)
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True)
    query_sql = models.TextField()
    ativo = models.BooleanField(default=True)
    limite_linhas_tela = models.IntegerField(default=1000)
    criado_por = models.ForeignKey(Usuario, on_delete=models.PROTECT)

    class Meta:
        unique_together = ['empresa', 'nome']

class Filtro(models.Model):
    relatorio = models.ForeignKey(Relatorio, related_name='filtros', on_delete=models.CASCADE)
    parametro = models.CharField(max_length=100)  # @data_inicio
    label = models.CharField(max_length=255)      # "Data Início"
    tipo = models.CharField(choices=TIPOS_FILTRO) # DATA, TEXTO, NUMERO, LISTA
    obrigatorio = models.BooleanField(default=False)
    valor_padrao = models.CharField(blank=True)
    opcoes = models.JSONField(null=True)  # Para tipo LISTA
    ordem = models.IntegerField(default=0)

class Permissao(models.Model):
    relatorio = models.ForeignKey(Relatorio, on_delete=models.CASCADE)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    nivel = models.CharField(choices=NIVEIS)  # VISUALIZAR, EXPORTAR

    class Meta:
        unique_together = ['relatorio', 'usuario']
```

## Multi-Tenancy

**Estratégia**: Coluna `empresa_id` + Mixin nas views

```python
# core/mixins.py
class EmpresaQuerySetMixin:
    """Filtra automaticamente por empresa do usuário"""
    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(empresa_id=self.request.user.empresa_id)
```

## Autenticação (JWT)

```python
# config/settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}
```

**Roles**:
- `ADMIN` - Tudo
- `TECNICO` - Conexões e relatórios
- `USUARIO` - Apenas consumir

## Conexões Externas

```python
# services/database_connector.py
class DatabaseConnector:
    def __init__(self, conexao: Conexao):
        self.conexao = conexao
        self.senha = decrypt(conexao.senha_encriptada)

    def get_connection(self):
        if self.conexao.tipo == 'SQLSERVER':
            return self._connect_sqlserver()
        elif self.conexao.tipo == 'POSTGRESQL':
            return self._connect_postgresql()
        # ...

    def _connect_sqlserver(self):
        conn_str = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={self.conexao.host},{self.conexao.porta};"
            f"DATABASE={self.conexao.database};"
            f"UID={self.conexao.usuario};"
            f"PWD={self.senha};"
        )
        return pyodbc.connect(conn_str)
```

## Execução com Pandas

```python
# services/query_executor.py
class QueryExecutor:
    def execute(self, conexao, query, params=None, limit=None):
        conn = DatabaseConnector(conexao).get_connection()
        try:
            df = pd.read_sql(query, conn)
            if limit:
                df = df.head(limit)
            return df
        finally:
            conn.close()
```

## Export Excel

```python
# services/excel_exporter.py
class ExcelExporter:
    def export(self, df: pd.DataFrame) -> BytesIO:
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Dados', index=False)
        output.seek(0)
        return output
```

## Padrões de Código

### Backend (Python)
```python
# Arquivos: snake_case
# query_executor.py

# Classes: PascalCase
# class QueryExecutor:

# Funções/métodos: snake_case
# def execute_query():

# Constantes: UPPER_SNAKE_CASE
# MAX_ROWS_DISPLAY = 1000
```

### Frontend (TypeScript)
```typescript
// Arquivos: kebab-case
// relatorio-form.tsx

// Componentes: PascalCase
// function RelatorioForm() {}

// Funções: camelCase
// async function fetchRelatorios() {}
```

### Views DRF
```python
class RelatorioViewSet(EmpresaQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = RelatorioSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def executar(self, request, pk=None):
        relatorio = self.get_object()
        # ...
```

### API Client (Frontend)
```typescript
// services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## Variáveis de Ambiente

```env
# backend/.env
DEBUG=True
SECRET_KEY=sua-chave-secreta
DATABASE_URL=postgres://user:pass@localhost:5432/forgereports
ENCRYPTION_KEY=chave-32-bytes-para-aes

# frontend/.env
VITE_API_URL=http://localhost:8000/api
```

## Dependências

### Backend (requirements.txt)
```
Django>=4.2
djangorestframework>=3.14
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
psycopg2-binary>=2.9
pyodbc>=5.0
pandas>=2.0
openpyxl>=3.1
python-dotenv>=1.0
cryptography>=41.0
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18",
    "react-router-dom": "^6",
    "axios": "^1.6",
    "@tanstack/react-query": "^5"
  },
  "devDependencies": {
    "vite": "^5",
    "tailwindcss": "^3",
    "typescript": "^5"
  }
}
```

## Limites e Defaults

| Config | Valor | Motivo |
|--------|-------|--------|
| Max linhas em tela | 1.000 | Performance frontend |
| Max linhas export | 100.000 | Memória/tempo |
| Timeout query | 30s | UX |
| Max conexões/empresa | 10 | Controle |
| Max relatórios/empresa | 100 | Controle |
| JWT access token | 30min | Segurança |
| JWT refresh token | 7 dias | UX |
