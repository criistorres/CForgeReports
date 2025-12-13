# Fase 01 - Autenticação e Multi-tenancy

## Objetivo

Implementar login de usuários com JWT e isolamento por empresa (multi-tenant).

## Contexto

- Projeto estruturado (Fase 0 completa)
- Django + DRF configurado
- React + Vite configurado
- PostgreSQL funcionando

## Dependências

- Fase 0 completa

## Casos de Uso Relacionados

- [UC01 - Cadastro de Empresa](../casos-de-uso/UC01-cadastro-empresa.md)
- [UC02 - Gestão de Usuários](../casos-de-uso/UC02-gestao-usuarios.md)

## Entregas

### 1. Modelo Empresa

```python
# apps/empresas/models.py
import uuid
from django.db import models

class Empresa(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    ativo = models.BooleanField(default=True)
    max_usuarios = models.IntegerField(default=10)
    max_conexoes = models.IntegerField(default=5)
    max_relatorios = models.IntegerField(default=50)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'empresas'

    def __str__(self):
        return self.nome
```

### 2. Modelo Usuario (Custom User)

```python
# apps/usuarios/models.py
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class UsuarioManager(BaseUserManager):
    def create_user(self, email, empresa, password=None, **extra_fields):
        if not email:
            raise ValueError('Email é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, empresa=empresa, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class Usuario(AbstractBaseUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        TECNICO = 'TECNICO', 'Técnico'
        USUARIO = 'USUARIO', 'Usuário'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(
        'empresas.Empresa',
        on_delete=models.CASCADE,
        related_name='usuarios'
    )
    nome = models.CharField(max_length=255)
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USUARIO)
    ativo = models.BooleanField(default=True)
    ativado_em = models.DateTimeField(null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome']

    class Meta:
        db_table = 'usuarios'
        unique_together = ['empresa', 'email']

    def __str__(self):
        return f"{self.nome} ({self.email})"
```

### 3. Serializer de Token Customizado

```python
# apps/usuarios/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['empresa_id'] = str(user.empresa_id)
        token['role'] = user.role
        token['nome'] = user.nome
        return token

    def validate(self, attrs):
        # Buscar usuário por email (pode ter múltiplos em empresas diferentes)
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = Usuario.objects.get(email=email, ativo=True)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError('Credenciais inválidas')

        if not user.check_password(password):
            raise serializers.ValidationError('Credenciais inválidas')

        refresh = self.get_token(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': str(user.id),
                'nome': user.nome,
                'email': user.email,
                'role': user.role,
                'empresa_id': str(user.empresa_id),
            }
        }

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'role', 'ativo', 'ativado_em', 'criado_em']
        read_only_fields = ['id', 'criado_em']
```

### 4. Views de Autenticação

```python
# apps/usuarios/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Usuario
from .serializers import CustomTokenObtainPairSerializer, UsuarioSerializer
from core.mixins import EmpresaQuerySetMixin
from core.permissions import IsAdmin

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UsuarioViewSet(EmpresaQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Usuario.objects.filter(empresa_id=self.request.user.empresa_id)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
```

### 5. Mixin de Empresa

```python
# core/mixins.py
class EmpresaQuerySetMixin:
    """Filtra automaticamente por empresa do usuário logado"""

    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            return qs.filter(empresa_id=self.request.user.empresa_id)
        return qs.none()
```

### 6. Permissions Customizadas

```python
# core/permissions.py
from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'ADMIN'

class IsTecnicoOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['ADMIN', 'TECNICO']
```

### 7. URLs

```python
# config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from apps.usuarios.views import CustomTokenObtainPairView, UsuarioViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
]
```

### 8. Script de Seed

```python
# backend/seed.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.empresas.models import Empresa
from apps.usuarios.models import Usuario

def seed():
    # Criar empresa demo
    empresa, created = Empresa.objects.get_or_create(
        slug='demo',
        defaults={
            'nome': 'Empresa Demo',
        }
    )
    print(f"Empresa: {empresa.nome} ({'criada' if created else 'já existia'})")

    # Criar admin
    admin, created = Usuario.objects.get_or_create(
        email='admin@demo.com',
        empresa=empresa,
        defaults={
            'nome': 'Administrador',
            'role': 'ADMIN',
        }
    )
    if created:
        admin.set_password('admin123')
        admin.save()
        print(f"Admin criado: {admin.email} / admin123")
    else:
        print(f"Admin já existe: {admin.email}")

if __name__ == '__main__':
    seed()
```

### 9. Frontend - AuthContext

```typescript
// frontend/src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../services/api'

interface User {
  id: string
  nome: string
  email: string
  role: string
  empresa_id: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  async function login(email: string, password: string) {
    const response = await api.post('/token/', { email, password })
    const { access, refresh, user } = response.data

    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(user))

    setUser(user)
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### 10. Frontend - Página de Login

```typescript
// frontend/src/pages/Login.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Email ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg w-96">
        <h1 className="text-2xl font-bold text-white mb-6">ForgeReports</h1>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-slate-400 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-slate-700 text-white rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-slate-400 mb-2">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-slate-700 text-white rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded font-semibold"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
```

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `backend/apps/empresas/models.py` | Criar |
| `backend/apps/usuarios/models.py` | Criar |
| `backend/apps/usuarios/serializers.py` | Criar |
| `backend/apps/usuarios/views.py` | Criar |
| `backend/core/mixins.py` | Criar |
| `backend/core/permissions.py` | Criar |
| `backend/config/urls.py` | Modificar |
| `backend/seed.py` | Criar |
| `frontend/src/contexts/AuthContext.tsx` | Criar |
| `frontend/src/pages/Login.tsx` | Criar |
| `frontend/src/pages/Dashboard.tsx` | Criar |
| `frontend/src/App.tsx` | Modificar |

## Critérios de Conclusão

- [ ] Login funciona com email/senha
- [ ] JWT contém empresa_id e role
- [ ] Rotas protegidas redirecionam para login
- [ ] Seed cria empresa e admin de teste
- [ ] API de usuários filtra por empresa
- [ ] Admin consegue ver lista de usuários
- [ ] Logout funciona
- [ ] Refresh token funciona

## Testes Manuais

```bash
# 1. Rodar migrations
python manage.py migrate

# 2. Rodar seed
python seed.py

# 3. Testar login via API
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@demo.com", "password": "admin123"}'

# 4. Testar frontend
# Acessar http://localhost:5173
# Logar com admin@demo.com / admin123
```

## Notas

- Senha do seed deve ser trocada em produção
- Considerar rate limiting no login (fase futura)
- Considerar 2FA (fase futura)
