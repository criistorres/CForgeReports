# Fase 03 - Relatórios Básicos

## Objetivo

Criar e executar relatórios (query SQL) com exportação para Excel. **Sem filtros ainda.**

## Contexto

- Conexões funcionando (Fase 2 completa)
- Pelo menos uma conexão cadastrada para testes
- Esta fase entrega o MVP funcional end-to-end
- Código do MVP (`forgereports/`) pode ser usado como referência

## Dependências

- Fase 2 completa (conexões)

## Casos de Uso Relacionados

- [UC04 - Criação de Relatório](../casos-de-uso/UC04-criacao-relatorio.md)
- [UC07 - Consumo de Relatório](../casos-de-uso/UC07-consumo-relatorio.md)

## Entregas

### 1. Modelos Django

```python
# apps/relatorios/models.py
import uuid
from django.db import models

class Relatorio(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey('empresas.Empresa', on_delete=models.CASCADE)
    conexao = models.ForeignKey('conexoes.Conexao', on_delete=models.PROTECT)
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True)
    query_sql = models.TextField()
    ativo = models.BooleanField(default=True)
    limite_linhas_tela = models.IntegerField(default=1000)
    permite_exportar = models.BooleanField(default=True)
    criado_por = models.ForeignKey('usuarios.Usuario', on_delete=models.PROTECT)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'relatorios'
        unique_together = ['empresa', 'nome']


# apps/execucoes/models.py
class Execucao(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey('empresas.Empresa', on_delete=models.CASCADE)
    relatorio = models.ForeignKey('relatorios.Relatorio', on_delete=models.CASCADE)
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.CASCADE)
    filtros_usados = models.JSONField(null=True, blank=True)
    iniciado_em = models.DateTimeField(auto_now_add=True)
    finalizado_em = models.DateTimeField(null=True)
    tempo_execucao_ms = models.IntegerField(null=True)
    sucesso = models.BooleanField(default=False)
    erro = models.TextField(null=True, blank=True)
    qtd_linhas = models.IntegerField(null=True)
    exportou = models.BooleanField(default=False)
    exportado_em = models.DateTimeField(null=True)

    class Meta:
        db_table = 'execucoes'
        ordering = ['-iniciado_em']
```

### 2. Validação de Query

```python
# services/query_validator.py
import re

BLOCKED_KEYWORDS = [
    'INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE',
    'ALTER', 'CREATE', 'EXEC', 'EXECUTE', 'GRANT', 'REVOKE',
    'BACKUP', 'RESTORE', 'SHUTDOWN'
]

def validar_query(query: str) -> tuple[bool, str | None]:
    """Valida se a query é segura (apenas SELECT)"""
    query_upper = query.upper().strip()

    # Remover comentários
    query_sem_comentarios = re.sub(r'--.*$', '', query_upper, flags=re.MULTILINE)
    query_sem_comentarios = re.sub(r'/\*.*?\*/', '', query_sem_comentarios, flags=re.DOTALL)
    query_sem_comentarios = query_sem_comentarios.strip()

    # Deve começar com SELECT
    if not query_sem_comentarios.startswith('SELECT'):
        return False, 'Query deve começar com SELECT'

    # Verificar keywords bloqueadas
    for keyword in BLOCKED_KEYWORDS:
        pattern = rf'\b{keyword}\b'
        if re.search(pattern, query_sem_comentarios, re.IGNORECASE):
            return False, f'Comando {keyword} não é permitido'

    return True, None
```

### 3. Serviço de Execução (baseado no MVP)

```python
# services/query_executor.py
import pandas as pd
from datetime import datetime
from django.utils import timezone
from apps.relatorios.models import Relatorio
from apps.execucoes.models import Execucao
from services.database_connector import DatabaseConnector

class QueryExecutor:
    def __init__(self, relatorio: Relatorio):
        self.relatorio = relatorio
        self.connector = DatabaseConnector(relatorio.conexao)

    def executar(self, usuario, filtros: dict = None, limite: int = None) -> dict:
        """Executa relatório e retorna resultado"""
        inicio = datetime.now()
        limite = limite or self.relatorio.limite_linhas_tela

        # Criar registro de execução
        execucao = Execucao.objects.create(
            empresa=self.relatorio.empresa,
            relatorio=self.relatorio,
            usuario=usuario,
            filtros_usados=filtros
        )

        try:
            # Executar query
            conn = self.connector.get_connection()
            df = pd.read_sql(self.relatorio.query_sql, conn)
            conn.close()

            tempo_ms = int((datetime.now() - inicio).total_seconds() * 1000)
            total_linhas = len(df)

            # Limitar linhas para exibição
            df_limitado = df.head(limite)

            # Atualizar execução
            execucao.finalizado_em = timezone.now()
            execucao.tempo_execucao_ms = tempo_ms
            execucao.sucesso = True
            execucao.qtd_linhas = total_linhas
            execucao.save()

            return {
                'sucesso': True,
                'colunas': df_limitado.columns.tolist(),
                'dados': df_limitado.to_dict('records'),
                'total_linhas': total_linhas,
                'linhas_exibidas': len(df_limitado),
                'tempo_ms': tempo_ms,
                'execucao_id': str(execucao.id)
            }

        except Exception as e:
            tempo_ms = int((datetime.now() - inicio).total_seconds() * 1000)

            execucao.finalizado_em = timezone.now()
            execucao.tempo_execucao_ms = tempo_ms
            execucao.sucesso = False
            execucao.erro = str(e)
            execucao.save()

            return {
                'sucesso': False,
                'erro': str(e)
            }
```

### 4. Exportação Excel (baseado no MVP)

```python
# services/excel_exporter.py
import pandas as pd
from io import BytesIO

class ExcelExporter:
    def exportar(self, relatorio, filtros: dict = None) -> BytesIO:
        """Exporta relatório completo para Excel"""
        from services.database_connector import DatabaseConnector

        connector = DatabaseConnector(relatorio.conexao)
        conn = connector.get_connection()

        df = pd.read_sql(relatorio.query_sql, conn)
        conn.close()

        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Dados', index=False)

            # Auto-ajustar largura das colunas
            worksheet = writer.sheets['Dados']
            for idx, col in enumerate(df.columns):
                max_length = max(
                    df[col].astype(str).map(len).max(),
                    len(str(col))
                ) + 2
                worksheet.column_dimensions[chr(65 + idx)].width = min(max_length, 50)

        output.seek(0)
        return output
```

### 5. Serializers

```python
# apps/relatorios/serializers.py
from rest_framework import serializers
from .models import Relatorio
from services.query_validator import validar_query

class RelatorioSerializer(serializers.ModelSerializer):
    conexao_nome = serializers.CharField(source='conexao.nome', read_only=True)

    class Meta:
        model = Relatorio
        fields = [
            'id', 'nome', 'descricao', 'conexao', 'conexao_nome',
            'query_sql', 'ativo', 'limite_linhas_tela',
            'permite_exportar', 'criado_em'
        ]
        read_only_fields = ['id', 'criado_em']

    def validate_query_sql(self, value):
        valida, erro = validar_query(value)
        if not valida:
            raise serializers.ValidationError(erro)
        return value

    def create(self, validated_data):
        validated_data['empresa_id'] = self.context['request'].user.empresa_id
        validated_data['criado_por'] = self.context['request'].user
        return super().create(validated_data)


class ExecutarRelatorioSerializer(serializers.Serializer):
    filtros = serializers.DictField(required=False, default=dict)
```

### 6. Views

```python
# apps/relatorios/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.utils import timezone
from .models import Relatorio
from .serializers import RelatorioSerializer, ExecutarRelatorioSerializer
from core.mixins import EmpresaQuerySetMixin
from core.permissions import IsTecnicoOrAdmin
from services.query_executor import QueryExecutor
from services.excel_exporter import ExcelExporter

class RelatorioViewSet(EmpresaQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = RelatorioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Relatorio.objects.filter(
            empresa_id=self.request.user.empresa_id,
            ativo=True
        ).select_related('conexao')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTecnicoOrAdmin()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def executar(self, request, pk=None):
        """Executa o relatório e retorna dados"""
        relatorio = self.get_object()
        serializer = ExecutarRelatorioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        executor = QueryExecutor(relatorio)
        resultado = executor.executar(
            usuario=request.user,
            filtros=serializer.validated_data.get('filtros')
        )

        return Response(resultado)

    @action(detail=True, methods=['post'])
    def testar(self, request, pk=None):
        """Testa a query com limite de 10 linhas"""
        relatorio = self.get_object()

        executor = QueryExecutor(relatorio)
        resultado = executor.executar(
            usuario=request.user,
            limite=10
        )

        return Response(resultado)

    @action(detail=True, methods=['post'])
    def exportar(self, request, pk=None):
        """Exporta relatório para Excel"""
        relatorio = self.get_object()

        exporter = ExcelExporter()
        excel_file = exporter.exportar(relatorio)

        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{relatorio.nome}_{timestamp}.xlsx"

        response = HttpResponse(
            excel_file.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
```

### 7. Frontend - Página de Relatórios

```typescript
// frontend/src/pages/Relatorios.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

interface Relatorio {
  id: string
  nome: string
  descricao: string
  conexao_nome: string
}

export default function Relatorios() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])

  useEffect(() => {
    api.get('/relatorios/').then(res => setRelatorios(res.data))
  }, [])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <Link
          to="/relatorios/novo"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Novo Relatório
        </Link>
      </div>

      <div className="grid gap-4">
        {relatorios.map(rel => (
          <div key={rel.id} className="bg-slate-800 p-4 rounded-lg flex justify-between">
            <div>
              <h3 className="text-white font-semibold">{rel.nome}</h3>
              <p className="text-slate-400 text-sm">{rel.descricao}</p>
              <p className="text-slate-500 text-xs">Conexão: {rel.conexao_nome}</p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/relatorios/${rel.id}/executar`}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                Executar
              </Link>
              <Link
                to={`/relatorios/${rel.id}`}
                className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded"
              >
                Editar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 8. Frontend - Executar Relatório

```typescript
// frontend/src/pages/ExecutarRelatorio.tsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function ExecutarRelatorio() {
  const { id } = useParams()
  const [relatorio, setRelatorio] = useState<any>(null)
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get(`/relatorios/${id}/`).then(res => setRelatorio(res.data))
  }, [id])

  async function executar() {
    setLoading(true)
    try {
      const res = await api.post(`/relatorios/${id}/executar/`)
      setResultado(res.data)
    } catch (err) {
      alert('Erro ao executar')
    } finally {
      setLoading(false)
    }
  }

  async function exportar() {
    const res = await api.post(`/relatorios/${id}/exportar/`, {}, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `${relatorio.nome}.xlsx`
    a.click()
  }

  if (!relatorio) return <div>Carregando...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">{relatorio.nome}</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={executar}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {loading ? 'Executando...' : 'Executar'}
        </button>
        {resultado?.sucesso && (
          <button
            onClick={exportar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Exportar Excel
          </button>
        )}
      </div>

      {resultado?.sucesso && (
        <div className="bg-slate-800 rounded-lg overflow-auto">
          <div className="text-slate-400 p-4 text-sm">
            {resultado.linhas_exibidas} de {resultado.total_linhas} linhas
            ({resultado.tempo_ms}ms)
          </div>
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                {resultado.colunas.map((col: string) => (
                  <th key={col} className="text-left p-3 text-slate-300">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resultado.dados.map((row: any, i: number) => (
                <tr key={i} className="border-t border-slate-700">
                  {resultado.colunas.map((col: string) => (
                    <td key={col} className="p-3 text-white">{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {resultado?.erro && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded">
          {resultado.erro}
        </div>
      )}
    </div>
  )
}
```

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `backend/apps/relatorios/models.py` | Criar |
| `backend/apps/execucoes/models.py` | Criar |
| `backend/apps/relatorios/serializers.py` | Criar |
| `backend/apps/relatorios/views.py` | Criar |
| `backend/apps/relatorios/urls.py` | Criar |
| `backend/services/query_validator.py` | Criar |
| `backend/services/query_executor.py` | Criar |
| `backend/services/excel_exporter.py` | Criar |
| `frontend/src/pages/Relatorios.tsx` | Criar |
| `frontend/src/pages/RelatorioForm.tsx` | Criar |
| `frontend/src/pages/ExecutarRelatorio.tsx` | Criar |

## Critérios de Conclusão

- [ ] CRUD de relatórios funciona
- [ ] Query com INSERT/DELETE é bloqueada
- [ ] Testar query mostra preview (10 linhas)
- [ ] Executar query retorna dados
- [ ] Tabela exibe resultado formatado
- [ ] Limite de linhas em tela funciona
- [ ] Exportar Excel funciona
- [ ] Execução é registrada no banco
- [ ] Erro mostra mensagem amigável

## Testes Manuais (Fluxo E2E)

```bash
# 1. Logar como técnico
# 2. Criar relatório: "SELECT TOP 100 * FROM tabela"
# 3. Testar query no editor
# 4. Salvar relatório
# 5. Executar relatório
# 6. Ver resultado na tabela
# 7. Exportar para Excel
# 8. Verificar arquivo baixado
```

## Notas

- Esta fase NÃO implementa filtros (Fase 4)
- Esta fase NÃO implementa permissões (Fase 5)
- Todos veem todos os relatórios da empresa por enquanto
- Código do MVP (`forgereports/reports/views.py`) serve como referência
