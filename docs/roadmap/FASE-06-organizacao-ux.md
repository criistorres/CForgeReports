# Fase 06 - Organização e UX

## Objetivo

Melhorar experiência do usuário: pastas, favoritos, histórico, busca e dashboard.

## Contexto

- Sistema funcional completo (Fases 0-5 completas)
- Usuários conseguem criar e consumir relatórios
- Falta organização e conveniências de UX

## Dependências

- Fase 5 completa (permissões)

## Casos de Uso Relacionados

- [UC08 - Histórico de Execuções](../casos-de-uso/UC08-historico.md)

## Entregas

### 1. Modelos Django

```python
# apps/relatorios/models.py (adicionar)
class Pasta(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey('empresas.Empresa', on_delete=models.CASCADE)
    nome = models.CharField(max_length=255)
    pasta_pai = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subpastas')
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pastas'
        unique_together = ['empresa', 'pasta_pai', 'nome']


class Favorito(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.CASCADE, related_name='favoritos')
    relatorio = models.ForeignKey(Relatorio, on_delete=models.CASCADE, related_name='favoritos')
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'favoritos'
        unique_together = ['usuario', 'relatorio']


# Adicionar ao modelo Relatorio
class Relatorio(models.Model):
    # ... campos existentes
    pasta = models.ForeignKey(Pasta, null=True, blank=True, on_delete=models.SET_NULL, related_name='relatorios')
```

### 2. Views de Pastas

```python
# apps/relatorios/views.py (adicionar)
class PastaViewSet(EmpresaQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = PastaSerializer
    permission_classes = [IsAuthenticated, IsTecnicoOrAdmin]

    def get_queryset(self):
        return Pasta.objects.filter(empresa_id=self.request.user.empresa_id)

    def perform_create(self, serializer):
        serializer.save(empresa_id=self.request.user.empresa_id)
```

### 3. Views de Favoritos

```python
# apps/relatorios/views.py (adicionar)
class FavoritoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        favoritos = Favorito.objects.filter(
            usuario=request.user
        ).select_related('relatorio')

        data = [
            {
                'id': str(f.id),
                'relatorio_id': str(f.relatorio_id),
                'relatorio_nome': f.relatorio.nome,
                'relatorio_descricao': f.relatorio.descricao
            }
            for f in favoritos
        ]
        return Response(data)

    def create(self, request):
        relatorio_id = request.data.get('relatorio_id')
        Favorito.objects.get_or_create(
            usuario=request.user,
            relatorio_id=relatorio_id
        )
        return Response({'success': True})

    def destroy(self, request, pk=None):
        Favorito.objects.filter(
            usuario=request.user,
            relatorio_id=pk
        ).delete()
        return Response({'success': True})
```

### 4. Views de Histórico

```python
# apps/execucoes/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Execucao

class HistoricoViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ExecucaoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Execucao.objects.filter(empresa_id=user.empresa_id)

        # Usuário só vê seu próprio histórico
        if user.role == 'USUARIO':
            qs = qs.filter(usuario=user)

        # Filtros
        relatorio_id = self.request.query_params.get('relatorio_id')
        if relatorio_id:
            qs = qs.filter(relatorio_id=relatorio_id)

        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id and user.role in ['ADMIN', 'TECNICO']:
            qs = qs.filter(usuario_id=usuario_id)

        sucesso = self.request.query_params.get('sucesso')
        if sucesso is not None:
            qs = qs.filter(sucesso=sucesso == 'true')

        return qs.select_related('relatorio', 'usuario')[:100]
```

### 5. Busca de Relatórios

```python
# apps/relatorios/views.py (modificar get_queryset)
def get_queryset(self):
    qs = super().get_queryset()

    # Busca por nome/descrição
    busca = self.request.query_params.get('busca')
    if busca:
        qs = qs.filter(
            models.Q(nome__icontains=busca) |
            models.Q(descricao__icontains=busca)
        )

    # Filtro por pasta
    pasta_id = self.request.query_params.get('pasta_id')
    if pasta_id:
        qs = qs.filter(pasta_id=pasta_id)

    return qs
```

### 6. Frontend - Dashboard

```typescript
// frontend/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [favoritos, setFavoritos] = useState([])
  const [historico, setHistorico] = useState([])

  useEffect(() => {
    api.get('/favoritos/').then(res => setFavoritos(res.data))
    api.get('/historico/?limit=5').then(res => setHistorico(res.data))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Olá, {user?.nome}!
      </h1>

      {/* Favoritos */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">⭐ Meus Favoritos</h2>
        <div className="grid grid-cols-3 gap-4">
          {favoritos.map((fav: any) => (
            <Link
              key={fav.id}
              to={`/relatorios/${fav.relatorio_id}/executar`}
              className="bg-slate-800 p-4 rounded-lg hover:bg-slate-700"
            >
              <h3 className="text-white font-medium">{fav.relatorio_nome}</h3>
              <p className="text-slate-400 text-sm">{fav.relatorio_descricao}</p>
            </Link>
          ))}
          {favoritos.length === 0 && (
            <p className="text-slate-500">Nenhum favorito ainda</p>
          )}
        </div>
      </section>

      {/* Histórico Recente */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">🕐 Execuções Recentes</h2>
        <div className="bg-slate-800 rounded-lg">
          {historico.map((exec: any) => (
            <div key={exec.id} className="flex items-center justify-between p-4 border-b border-slate-700">
              <div>
                <span className="text-white">{exec.relatorio_nome}</span>
                <span className="text-slate-400 text-sm ml-4">
                  {new Date(exec.iniciado_em).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {exec.sucesso ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <span className="text-red-400">✗</span>
                )}
                <Link
                  to={`/relatorios/${exec.relatorio_id}/executar`}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Re-executar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Links Rápidos */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">📋 Ações Rápidas</h2>
        <div className="flex gap-4">
          <Link
            to="/relatorios"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Ver Relatórios
          </Link>
          {user?.role !== 'USUARIO' && (
            <Link
              to="/relatorios/novo"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Novo Relatório
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
```

### 7. Frontend - Botão Favoritar

```typescript
// frontend/src/components/FavoritoButton.tsx
import { useState } from 'react'
import api from '../services/api'

export default function FavoritoButton({ relatorioId, isFavorito: initial }: Props) {
  const [isFavorito, setIsFavorito] = useState(initial)

  async function toggle() {
    if (isFavorito) {
      await api.delete(`/favoritos/${relatorioId}/`)
    } else {
      await api.post('/favoritos/', { relatorio_id: relatorioId })
    }
    setIsFavorito(!isFavorito)
  }

  return (
    <button onClick={toggle} className="text-2xl">
      {isFavorito ? '⭐' : '☆'}
    </button>
  )
}
```

### 8. Frontend - Página de Histórico

```typescript
// frontend/src/pages/Historico.tsx
import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Historico() {
  const [execucoes, setExecucoes] = useState([])
  const [filtros, setFiltros] = useState({})

  useEffect(() => {
    const params = new URLSearchParams(filtros as any)
    api.get(`/historico/?${params}`).then(res => setExecucoes(res.data))
  }, [filtros])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Histórico de Execuções</h1>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          onChange={e => setFiltros({ ...filtros, data_inicio: e.target.value })}
          className="bg-slate-700 p-2 rounded text-white"
        />
        <select
          onChange={e => setFiltros({ ...filtros, sucesso: e.target.value })}
          className="bg-slate-700 p-2 rounded text-white"
        >
          <option value="">Todos</option>
          <option value="true">Sucesso</option>
          <option value="false">Erro</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4 text-slate-300">Data/Hora</th>
              <th className="text-left p-4 text-slate-300">Relatório</th>
              <th className="text-left p-4 text-slate-300">Usuário</th>
              <th className="text-left p-4 text-slate-300">Status</th>
              <th className="text-left p-4 text-slate-300">Tempo</th>
            </tr>
          </thead>
          <tbody>
            {execucoes.map((exec: any) => (
              <tr key={exec.id} className="border-t border-slate-700">
                <td className="p-4 text-white">
                  {new Date(exec.iniciado_em).toLocaleString('pt-BR')}
                </td>
                <td className="p-4 text-white">{exec.relatorio_nome}</td>
                <td className="p-4 text-slate-300">{exec.usuario_nome}</td>
                <td className="p-4">
                  {exec.sucesso ? (
                    <span className="text-green-400">✓ Sucesso</span>
                  ) : (
                    <span className="text-red-400">✗ Erro</span>
                  )}
                </td>
                <td className="p-4 text-slate-300">{exec.tempo_execucao_ms}ms</td>
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
| `backend/apps/relatorios/models.py` | Modificar (add Pasta, Favorito) |
| `backend/apps/relatorios/views.py` | Modificar (add ViewSets) |
| `backend/apps/execucoes/views.py` | Criar |
| `backend/apps/execucoes/serializers.py` | Criar |
| `frontend/src/pages/Dashboard.tsx` | Modificar |
| `frontend/src/pages/Historico.tsx` | Criar |
| `frontend/src/components/FavoritoButton.tsx` | Criar |
| `frontend/src/components/BuscaRelatorios.tsx` | Criar |

## Critérios de Conclusão

- [ ] Criar pasta funciona
- [ ] Mover relatório para pasta funciona
- [ ] Adicionar/remover favorito funciona
- [ ] Dashboard mostra favoritos
- [ ] Dashboard mostra histórico recente
- [ ] Busca de relatórios funciona
- [ ] Histórico filtra por relatório/usuário/data
- [ ] Usuário só vê seu próprio histórico
- [ ] Admin vê histórico de todos

## Notas

- Esta fase completa o **Marco 2 - Produto Básico**
- Após esta fase, sistema está pronto para primeiros clientes
- Fases futuras são melhorias incrementais (multi-banco, agendamento, etc.)
