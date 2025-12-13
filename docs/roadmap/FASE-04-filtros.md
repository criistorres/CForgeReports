# Fase 04 - Filtros

## Objetivo

Adicionar filtros dinâmicos aos relatórios (parâmetros que o usuário preenche antes de executar).

## Contexto

- Relatórios básicos funcionando (Fase 3 completa)
- Query pode ter placeholders como `@data_inicio`, `@vendedor`
- Usuário precisa preencher filtros antes de executar

## Dependências

- Fase 3 completa (relatórios básicos)

## Casos de Uso Relacionados

- [UC05 - Definição de Filtros](../casos-de-uso/UC05-filtros.md)

## Entregas

### 1. Modelo Django

```python
# apps/relatorios/models.py (adicionar)
class Filtro(models.Model):
    class TipoFiltro(models.TextChoices):
        DATA = 'DATA', 'Data'
        TEXTO = 'TEXTO', 'Texto'
        NUMERO = 'NUMERO', 'Número'
        LISTA = 'LISTA', 'Lista'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    relatorio = models.ForeignKey(Relatorio, on_delete=models.CASCADE, related_name='filtros')
    parametro = models.CharField(max_length=100)  # @data_inicio
    label = models.CharField(max_length=255)      # "Data Início"
    tipo = models.CharField(max_length=20, choices=TipoFiltro.choices)
    obrigatorio = models.BooleanField(default=False)
    valor_padrao = models.CharField(max_length=255, blank=True)
    opcoes = models.JSONField(null=True, blank=True)  # Para tipo LISTA
    ordem = models.IntegerField(default=0)

    class Meta:
        db_table = 'filtros'
        unique_together = ['relatorio', 'parametro']
        ordering = ['ordem']
```

### 2. Serviço de Substituição de Parâmetros

```python
# services/query_params.py
from datetime import datetime, date
import re

def substituir_parametros(query: str, filtros: list, valores: dict) -> tuple[str, str | None]:
    """
    Substitui placeholders na query pelos valores dos filtros.
    Retorna (query_final, erro) - erro é None se sucesso.
    """
    query_final = query

    for filtro in filtros:
        param = filtro.parametro
        valor = valores.get(param)

        # Validar obrigatórios
        if filtro.obrigatorio and not valor:
            return '', f'Filtro "{filtro.label}" é obrigatório'

        # Formatar valor
        valor_formatado = formatar_valor(valor, filtro.tipo)

        # Substituir na query
        query_final = query_final.replace(param, valor_formatado)

    return query_final, None


def formatar_valor(valor, tipo: str) -> str:
    """Formata valor para uso seguro em SQL"""
    if valor is None or valor == '':
        return 'NULL'

    if tipo == 'DATA':
        # Aceita string ISO ou objeto date/datetime
        if isinstance(valor, (date, datetime)):
            return f"'{valor.strftime('%Y-%m-%d')}'"
        return f"'{valor}'"

    elif tipo == 'TEXTO' or tipo == 'LISTA':
        # Escapar aspas simples
        valor_escapado = str(valor).replace("'", "''")
        return f"'{valor_escapado}'"

    elif tipo == 'NUMERO':
        return str(float(valor))

    return f"'{str(valor)}'"
```

### 3. Atualizar Query Executor

```python
# services/query_executor.py (modificar)
from services.query_params import substituir_parametros

class QueryExecutor:
    def executar(self, usuario, filtros_valores: dict = None, limite: int = None) -> dict:
        inicio = datetime.now()
        limite = limite or self.relatorio.limite_linhas_tela

        # Buscar filtros do relatório
        filtros = list(self.relatorio.filtros.all())

        # Substituir parâmetros se houver filtros
        query = self.relatorio.query_sql
        if filtros and filtros_valores:
            query, erro = substituir_parametros(query, filtros, filtros_valores)
            if erro:
                return {'sucesso': False, 'erro': erro}

        # Criar registro de execução
        execucao = Execucao.objects.create(
            empresa=self.relatorio.empresa,
            relatorio=self.relatorio,
            usuario=usuario,
            filtros_usados=filtros_valores
        )

        try:
            conn = self.connector.get_connection()
            df = pd.read_sql(query, conn)
            conn.close()
            # ... resto igual
```

### 4. Serializers

```python
# apps/relatorios/serializers.py (adicionar)
class FiltroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filtro
        fields = ['id', 'parametro', 'label', 'tipo', 'obrigatorio', 'valor_padrao', 'opcoes', 'ordem']
        read_only_fields = ['id']


class RelatorioComFiltrosSerializer(RelatorioSerializer):
    filtros = FiltroSerializer(many=True, read_only=True)

    class Meta(RelatorioSerializer.Meta):
        fields = RelatorioSerializer.Meta.fields + ['filtros']


class SalvarFiltrosSerializer(serializers.Serializer):
    filtros = FiltroSerializer(many=True)

    def save(self, relatorio):
        # Deletar filtros existentes
        relatorio.filtros.all().delete()

        # Criar novos
        for i, filtro_data in enumerate(self.validated_data['filtros']):
            Filtro.objects.create(
                relatorio=relatorio,
                ordem=i,
                **filtro_data
            )
```

### 5. Views

```python
# apps/relatorios/views.py (adicionar action)
@action(detail=True, methods=['get', 'put'])
def filtros(self, request, pk=None):
    relatorio = self.get_object()

    if request.method == 'GET':
        serializer = FiltroSerializer(relatorio.filtros.all(), many=True)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = SalvarFiltrosSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(relatorio)
        return Response({'success': True})
```

### 6. Frontend - Form de Filtros (edição)

```typescript
// frontend/src/components/FiltroForm.tsx
interface Filtro {
  parametro: string
  label: string
  tipo: 'DATA' | 'TEXTO' | 'NUMERO' | 'LISTA'
  obrigatorio: boolean
  valor_padrao?: string
  opcoes?: string[]
}

export default function FiltroForm({ filtros, onChange }: Props) {
  return (
    <div className="space-y-4">
      {filtros.map((filtro, idx) => (
        <div key={idx} className="bg-slate-700 p-4 rounded flex gap-4 items-center">
          <input
            value={filtro.parametro}
            placeholder="@parametro"
            onChange={e => updateFiltro(idx, 'parametro', e.target.value)}
            className="bg-slate-600 p-2 rounded text-white w-32"
          />
          <input
            value={filtro.label}
            placeholder="Label"
            onChange={e => updateFiltro(idx, 'label', e.target.value)}
            className="bg-slate-600 p-2 rounded text-white flex-1"
          />
          <select
            value={filtro.tipo}
            onChange={e => updateFiltro(idx, 'tipo', e.target.value)}
            className="bg-slate-600 p-2 rounded text-white"
          >
            <option value="DATA">Data</option>
            <option value="TEXTO">Texto</option>
            <option value="NUMERO">Número</option>
            <option value="LISTA">Lista</option>
          </select>
          <label className="text-white flex items-center gap-2">
            <input
              type="checkbox"
              checked={filtro.obrigatorio}
              onChange={e => updateFiltro(idx, 'obrigatorio', e.target.checked)}
            />
            Obrigatório
          </label>
          <button onClick={() => removerFiltro(idx)} className="text-red-400">
            Remover
          </button>
        </div>
      ))}
      <button onClick={adicionarFiltro} className="text-purple-400">
        + Adicionar Filtro
      </button>
    </div>
  )
}
```

### 7. Frontend - Input de Filtros (execução)

```typescript
// frontend/src/components/FiltroInput.tsx
interface Props {
  filtro: Filtro
  value: any
  onChange: (value: any) => void
}

export default function FiltroInput({ filtro, value, onChange }: Props) {
  switch (filtro.tipo) {
    case 'DATA':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="bg-slate-700 p-2 rounded text-white"
          required={filtro.obrigatorio}
        />
      )

    case 'TEXTO':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="bg-slate-700 p-2 rounded text-white"
          required={filtro.obrigatorio}
        />
      )

    case 'NUMERO':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="bg-slate-700 p-2 rounded text-white"
          required={filtro.obrigatorio}
        />
      )

    case 'LISTA':
      return (
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="bg-slate-700 p-2 rounded text-white"
          required={filtro.obrigatorio}
        >
          <option value="">Selecione...</option>
          {(filtro.opcoes || []).map(op => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
      )
  }
}
```

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `backend/apps/relatorios/models.py` | Modificar (add Filtro) |
| `backend/services/query_params.py` | Criar |
| `backend/services/query_executor.py` | Modificar |
| `backend/apps/relatorios/serializers.py` | Modificar |
| `backend/apps/relatorios/views.py` | Modificar |
| `frontend/src/components/FiltroForm.tsx` | Criar |
| `frontend/src/components/FiltroInput.tsx` | Criar |
| `frontend/src/pages/ExecutarRelatorio.tsx` | Modificar |

## Critérios de Conclusão

- [ ] Adicionar filtro tipo Data funciona
- [ ] Adicionar filtro tipo Texto funciona
- [ ] Adicionar filtro tipo Número funciona
- [ ] Adicionar filtro tipo Lista funciona
- [ ] Reordenar filtros funciona
- [ ] Excluir filtro funciona
- [ ] Filtro obrigatório valida antes de executar
- [ ] Valores são substituídos na query corretamente
- [ ] Filtros usados são salvos na execução

## Testes Manuais

```bash
# 1. Editar relatório existente
# 2. Adicionar filtro @data_inicio (Data, obrigatório)
# 3. Adicionar filtro @status (Lista: ["Ativo", "Inativo"])
# 4. Salvar
# 5. Executar relatório
# 6. Ver inputs de filtro
# 7. Tentar executar sem preencher data (deve dar erro)
# 8. Preencher e executar
# 9. Verificar resultado correto
```
