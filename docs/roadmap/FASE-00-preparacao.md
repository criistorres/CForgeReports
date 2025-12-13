# Fase 00 - Preparação

## Objetivo

Estruturar o projeto Django (backend) + React (frontend) com todas as dependências e configurações base.

## Contexto

- MVP Django existe e será usado como referência
- Protótipo UI existe para referência de design
- Vamos criar estrutura profissional separando backend/frontend

## Dependências

Nenhuma (primeira fase)

## Entregas

### 1. Criar estrutura de pastas

```bash
mkdir -p backend frontend
```

### 2. Configurar Backend Django

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

pip install django djangorestframework djangorestframework-simplejwt
pip install django-cors-headers python-dotenv
pip install psycopg2-binary pyodbc pandas openpyxl
pip install cryptography

django-admin startproject config .
```

### 3. Criar apps Django

```bash
cd backend
python manage.py startapp empresas
python manage.py startapp usuarios
python manage.py startapp conexoes
python manage.py startapp relatorios
python manage.py startapp execucoes
```

### 4. Estrutura do Backend

```
backend/
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── empresas/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── usuarios/
│   ├── conexoes/
│   ├── relatorios/
│   └── execucoes/
├── core/
│   ├── __init__.py
│   ├── permissions.py
│   ├── mixins.py
│   └── crypto.py
├── services/
│   ├── __init__.py
│   ├── database_connector.py
│   ├── query_executor.py
│   └── excel_exporter.py
├── manage.py
├── requirements.txt
└── .env.example
```

### 5. Configurar settings.py

```python
# config/settings.py
from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Local apps
    'apps.empresas',
    'apps.usuarios',
    'apps.conexoes',
    'apps.relatorios',
    'apps.execucoes',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

# CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'forgereports'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Custom user model
AUTH_USER_MODEL = 'usuarios.Usuario'

# Internationalization
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'

# Encryption
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', '')
```

### 6. Criar requirements.txt

```
# backend/requirements.txt
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

### 7. Criar .env.example

```env
# backend/.env.example
DEBUG=True
SECRET_KEY=sua-chave-secreta-aqui
DB_NAME=forgereports
DB_USER=postgres
DB_PASSWORD=sua-senha
DB_HOST=localhost
DB_PORT=5432
ENCRYPTION_KEY=chave-32-bytes-em-hex
```

### 8. Configurar Frontend React

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install axios react-router-dom @tanstack/react-query
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 9. Estrutura do Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   └── features/
│   ├── pages/
│   │   ├── Login.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   └── api.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

### 10. Configurar Tailwind

```javascript
// frontend/tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        }
      }
    },
  },
  plugins: [],
}
```

### 11. Configurar API Client

```typescript
// frontend/src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

### 12. Criar .env frontend

```env
# frontend/.env
VITE_API_URL=http://localhost:8000/api
```

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `backend/` | Diretório do projeto Django |
| `backend/config/settings.py` | Configurações Django |
| `backend/requirements.txt` | Dependências Python |
| `backend/.env.example` | Template de variáveis |
| `frontend/` | Diretório do projeto React |
| `frontend/src/services/api.ts` | Cliente HTTP |
| `frontend/.env` | Variáveis de ambiente |

## Critérios de Conclusão

- [ ] `python manage.py runserver` inicia sem erros
- [ ] `npm run dev` inicia frontend sem erros
- [ ] PostgreSQL configurado e acessível
- [ ] Migrations iniciais aplicadas
- [ ] CORS permite requisições do frontend
- [ ] Tailwind funcionando (testar classe bg-purple-500)
- [ ] Git atualizado com nova estrutura

## Comandos de Verificação

```bash
# Backend
cd backend
source venv/bin/activate
python manage.py check
python manage.py migrate
python manage.py runserver

# Frontend (outro terminal)
cd frontend
npm run dev
```

## Notas

- Não implementar lógica de negócio nesta fase
- Foco em estrutura e configuração
- Próxima fase (01) implementará autenticação
- Código do MVP (`forgereports/`) pode ser consultado como referência
