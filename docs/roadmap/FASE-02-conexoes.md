# Fase 02 - Conexões de Banco

## Objetivo

Permitir cadastro e teste de conexões SQL Server (e preparar para outros bancos).

## Contexto

- Auth funcionando (Fase 1 completa)
- Usuário logado tem empresa_id no JWT
- Apenas Admin e Técnico podem gerenciar conexões
- Código do MVP pode ser usado como referência

## Dependências

- Fase 1 completa

## Casos de Uso Relacionados

- [UC03 - Conexões de Banco](../casos-de-uso/UC03-conexoes-banco.md)

## Entregas

### 1. Modelo Conexao

```python
# apps/conexoes/models.py
import uuid
from django.db import models

class Conexao(models.Model):
    class TipoBanco(models.TextChoices):
        SQLSERVER = 'SQLSERVER', 'SQL Server'
        POSTGRESQL = 'POSTGRESQL', 'PostgreSQL'
        MYSQL = 'MYSQL', 'MySQL'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(
        'empresas.Empresa',
        on_delete=models.CASCADE,
        related_name='conexoes'
    )
    nome = models.CharField(max_length=255)
    tipo = models.CharField(max_length=20, choices=TipoBanco.choices)
    host = models.CharField(max_length=255)
    porta = models.IntegerField()
    database = models.CharField(max_length=255)
    usuario = models.CharField(max_length=255)
    senha_encriptada = models.TextField()
    ativo = models.BooleanField(default=True)
    ultimo_teste_em = models.DateTimeField(null=True, blank=True)
    ultimo_teste_ok = models.BooleanField(null=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'conexoes'
        unique_together = ['empresa', 'nome']

    def __str__(self):
        return f"{self.nome} ({self.tipo})"
```

### 2. Utilitário de Criptografia

```python
# core/crypto.py
import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings

def get_fernet():
    key = settings.ENCRYPTION_KEY.encode()
    # Derivar chave de 32 bytes
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b'forgereports_salt',
        iterations=100000,
    )
    derived_key = base64.urlsafe_b64encode(kdf.derive(key))
    return Fernet(derived_key)

def encrypt(text: str) -> str:
    f = get_fernet()
    return f.encrypt(text.encode()).decode()

def decrypt(encrypted_text: str) -> str:
    f = get_fernet()
    return f.decrypt(encrypted_text.encode()).decode()
```

### 3. Serviço de Conexão (baseado no MVP)

```python
# services/database_connector.py
import pyodbc
from apps.conexoes.models import Conexao
from core.crypto import decrypt

class DatabaseConnector:
    TIMEOUT = 30

    def __init__(self, conexao: Conexao):
        self.conexao = conexao
        self.senha = decrypt(conexao.senha_encriptada)

    def get_connection(self):
        if self.conexao.tipo == 'SQLSERVER':
            return self._connect_sqlserver()
        elif self.conexao.tipo == 'POSTGRESQL':
            return self._connect_postgresql()
        elif self.conexao.tipo == 'MYSQL':
            return self._connect_mysql()
        raise ValueError(f"Tipo de banco não suportado: {self.conexao.tipo}")

    def _connect_sqlserver(self):
        conn_str = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={self.conexao.host},{self.conexao.porta};"
            f"DATABASE={self.conexao.database};"
            f"UID={self.conexao.usuario};"
            f"PWD={self.senha};"
            f"Connection Timeout={self.TIMEOUT};"
        )
        return pyodbc.connect(conn_str)

    def _connect_postgresql(self):
        import psycopg2
        return psycopg2.connect(
            host=self.conexao.host,
            port=self.conexao.porta,
            database=self.conexao.database,
            user=self.conexao.usuario,
            password=self.senha,
            connect_timeout=self.TIMEOUT
        )

    def _connect_mysql(self):
        import pymysql
        return pymysql.connect(
            host=self.conexao.host,
            port=self.conexao.porta,
            database=self.conexao.database,
            user=self.conexao.usuario,
            password=self.senha,
            connect_timeout=self.TIMEOUT
        )

    def test_connection(self) -> tuple[bool, str]:
        try:
            conn = self.get_connection()
            conn.close()
            return True, "Conexão bem sucedida"
        except Exception as e:
            return False, str(e)


def test_connection_params(tipo, host, porta, database, usuario, senha) -> tuple[bool, str]:
    """Testa conexão sem salvar no banco"""
    if tipo == 'SQLSERVER':
        try:
            conn_str = (
                f"DRIVER={{ODBC Driver 17 for SQL Server}};"
                f"SERVER={host},{porta};"
                f"DATABASE={database};"
                f"UID={usuario};"
                f"PWD={senha};"
                f"Connection Timeout=10;"
            )
            conn = pyodbc.connect(conn_str)
            conn.close()
            return True, "Conexão bem sucedida"
        except Exception as e:
            return False, str(e)

    return False, f"Tipo {tipo} não suportado ainda"
```

### 4. Serializers

```python
# apps/conexoes/serializers.py
from rest_framework import serializers
from .models import Conexao
from core.crypto import encrypt

class ConexaoSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Conexao
        fields = [
            'id', 'nome', 'tipo', 'host', 'porta', 'database',
            'usuario', 'senha', 'ativo', 'ultimo_teste_em',
            'ultimo_teste_ok', 'criado_em'
        ]
        read_only_fields = ['id', 'criado_em', 'ultimo_teste_em', 'ultimo_teste_ok']

    def create(self, validated_data):
        senha = validated_data.pop('senha')
        validated_data['senha_encriptada'] = encrypt(senha)
        validated_data['empresa_id'] = self.context['request'].user.empresa_id
        return super().create(validated_data)

    def update(self, instance, validated_data):
        senha = validated_data.pop('senha', None)
        if senha:
            validated_data['senha_encriptada'] = encrypt(senha)
        return super().update(instance, validated_data)


class TestarConexaoSerializer(serializers.Serializer):
    tipo = serializers.ChoiceField(choices=Conexao.TipoBanco.choices)
    host = serializers.CharField()
    porta = serializers.IntegerField()
    database = serializers.CharField()
    usuario = serializers.CharField()
    senha = serializers.CharField()
```

### 5. Views

```python
# apps/conexoes/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Conexao
from .serializers import ConexaoSerializer, TestarConexaoSerializer
from core.mixins import EmpresaQuerySetMixin
from core.permissions import IsTecnicoOrAdmin
from services.database_connector import DatabaseConnector, test_connection_params

class ConexaoViewSet(EmpresaQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = ConexaoSerializer
    permission_classes = [IsAuthenticated, IsTecnicoOrAdmin]

    def get_queryset(self):
        return Conexao.objects.filter(empresa_id=self.request.user.empresa_id)

    @action(detail=False, methods=['post'])
    def testar(self, request):
        """Testa conexão antes de salvar"""
        serializer = TestarConexaoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        sucesso, mensagem = test_connection_params(**serializer.validated_data)

        return Response({
            'sucesso': sucesso,
            'mensagem': mensagem
        })

    @action(detail=True, methods=['post'])
    def testar_existente(self, request, pk=None):
        """Testa conexão já salva"""
        conexao = self.get_object()
        connector = DatabaseConnector(conexao)
        sucesso, mensagem = connector.test_connection()

        # Atualizar status do teste
        conexao.ultimo_teste_em = timezone.now()
        conexao.ultimo_teste_ok = sucesso
        conexao.save()

        return Response({
            'sucesso': sucesso,
            'mensagem': mensagem
        })
```

### 6. URLs

```python
# apps/conexoes/urls.py
from rest_framework.routers import DefaultRouter
from .views import ConexaoViewSet

router = DefaultRouter()
router.register(r'conexoes', ConexaoViewSet, basename='conexao')

urlpatterns = router.urls
```

```python
# config/urls.py (adicionar)
urlpatterns = [
    # ...
    path('api/', include('apps.conexoes.urls')),
]
```

### 7. Frontend - Página de Conexões

```typescript
// frontend/src/pages/Conexoes.tsx
import { useState, useEffect } from 'react'
import api from '../services/api'

interface Conexao {
  id: string
  nome: string
  tipo: string
  host: string
  porta: number
  database: string
  usuario: string
  ativo: boolean
  ultimo_teste_ok: boolean | null
}

export default function Conexoes() {
  const [conexoes, setConexoes] = useState<Conexao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConexoes()
  }, [])

  async function fetchConexoes() {
    try {
      const response = await api.get('/conexoes/')
      setConexoes(response.data)
    } finally {
      setLoading(false)
    }
  }

  async function testarConexao(id: string) {
    try {
      const response = await api.post(`/conexoes/${id}/testar_existente/`)
      alert(response.data.mensagem)
      fetchConexoes()
    } catch (err) {
      alert('Erro ao testar conexão')
    }
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Conexões</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
          Nova Conexão
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4 text-slate-300">Nome</th>
              <th className="text-left p-4 text-slate-300">Tipo</th>
              <th className="text-left p-4 text-slate-300">Host</th>
              <th className="text-left p-4 text-slate-300">Status</th>
              <th className="text-left p-4 text-slate-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {conexoes.map((conexao) => (
              <tr key={conexao.id} className="border-t border-slate-700">
                <td className="p-4 text-white">{conexao.nome}</td>
                <td className="p-4 text-slate-300">{conexao.tipo}</td>
                <td className="p-4 text-slate-300">{conexao.host}:{conexao.porta}</td>
                <td className="p-4">
                  {conexao.ultimo_teste_ok === true && (
                    <span className="text-green-400">✓ OK</span>
                  )}
                  {conexao.ultimo_teste_ok === false && (
                    <span className="text-red-400">✗ Erro</span>
                  )}
                  {conexao.ultimo_teste_ok === null && (
                    <span className="text-slate-500">Não testado</span>
                  )}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => testarConexao(conexao.id)}
                    className="text-purple-400 hover:text-purple-300 mr-4"
                  >
                    Testar
                  </button>
                  <button className="text-slate-400 hover:text-slate-300">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `backend/apps/conexoes/models.py` | Criar |
| `backend/apps/conexoes/serializers.py` | Criar |
| `backend/apps/conexoes/views.py` | Criar |
| `backend/apps/conexoes/urls.py` | Criar |
| `backend/core/crypto.py` | Criar |
| `backend/services/database_connector.py` | Criar |
| `backend/config/urls.py` | Modificar |
| `frontend/src/pages/Conexoes.tsx` | Criar |

## Critérios de Conclusão

- [ ] CRUD de conexões funciona
- [ ] Senha é criptografada no banco
- [ ] Teste de conexão SQL Server funciona
- [ ] Erro de conexão mostra mensagem clara
- [ ] Conexão só aparece para sua empresa
- [ ] Apenas Admin/Técnico pode criar conexões
- [ ] API não retorna senha

## Testes Manuais

```bash
# 1. Logar como admin
# 2. Acessar /conexoes
# 3. Criar nova conexão SQL Server
# 4. Testar conexão
# 5. Verificar no banco que senha está criptografada
```

## Notas

- Fase 2 foca em SQL Server (MVP já funciona)
- PostgreSQL e MySQL: drivers instalados, implementação similar
- Timeout de teste é 10 segundos
- Código do MVP (`forgereports/reports/views.py`) serve como referência
