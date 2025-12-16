# Fase 06 - Permissões

## Objetivo

Implementar controle de acesso: quais usuários podem ver/executar/exportar cada relatório.

## Contexto

- Estilo UI implementado (Fase 5 completa)
- Atualmente todos veem todos os relatórios da empresa
- Após esta fase: usuário só vê relatórios com permissão explícita

## Dependências

- Fase 5 completa (estilo UI)

## Casos de Uso Relacionados

- [UC06 - Permissões](../casos-de-uso/UC06-permissoes.md)

## Entregas

### 1. Modelo Django

```python
# apps/relatorios/models.py (adicionar)
class Permissao(models.Model):
    class NivelPermissao(models.TextChoices):
        VISUALIZAR = 'VISUALIZAR', 'Visualizar'
        EXPORTAR = 'EXPORTAR', 'Exportar'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    relatorio = models.ForeignKey(Relatorio, on_delete=models.CASCADE, related_name='permissoes')
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.CASCADE, related_name='permissoes_relatorios')
    nivel = models.CharField(max_length=20, choices=NivelPermissao.choices)
    criado_por = models.ForeignKey('usuarios.Usuario', on_delete=models.SET_NULL, null=True, related_name='+')
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'permissoes'
        unique_together = ['relatorio', 'usuario']
```

### 2. Serviço de Verificação

```python
# services/permissoes.py
from apps.relatorios.models import Permissao

def verificar_permissao(relatorio_id: str, usuario) -> dict:
    """
    Verifica permissão do usuário no relatório.
    Retorna {'tem_acesso': bool, 'pode_exportar': bool}
    """
    # Admin e Técnico sempre têm acesso total
    if usuario.role in ['ADMIN', 'TECNICO']:
        return {'tem_acesso': True, 'pode_exportar': True}

    # Buscar permissão explícita
    try:
        permissao = Permissao.objects.get(
            relatorio_id=relatorio_id,
            usuario=usuario
        )
        return {
            'tem_acesso': True,
            'pode_exportar': permissao.nivel == 'EXPORTAR'
        }
    except Permissao.DoesNotExist:
        return {'tem_acesso': False, 'pode_exportar': False}
```

### 3. Atualizar Listagem de Relatórios

```python
# apps/relatorios/views.py (modificar get_queryset)
def get_queryset(self):
    user = self.request.user
    qs = Relatorio.objects.filter(empresa_id=user.empresa_id, ativo=True)

    # Admin e Técnico veem todos
    if user.role in ['ADMIN', 'TECNICO']:
        return qs.select_related('conexao')

    # Usuário só vê com permissão
    return qs.filter(
        permissoes__usuario=user
    ).select_related('conexao').distinct()
```

### 4. Proteger Execução e Exportação

```python
# apps/relatorios/views.py (modificar actions)
from services.permissoes import verificar_permissao

@action(detail=True, methods=['post'])
def executar(self, request, pk=None):
    relatorio = self.get_object()

    # Verificar permissão
    perm = verificar_permissao(relatorio.id, request.user)
    if not perm['tem_acesso']:
        return Response({'error': 'Sem permissão'}, status=status.HTTP_403_FORBIDDEN)

    # ... resto igual

@action(detail=True, methods=['post'])
def exportar(self, request, pk=None):
    relatorio = self.get_object()

    # Verificar permissão de exportar
    perm = verificar_permissao(relatorio.id, request.user)
    if not perm['pode_exportar']:
        return Response({'error': 'Sem permissão para exportar'}, status=status.HTTP_403_FORBIDDEN)

    # ... resto igual
```

### 5. API de Permissões

```python
# apps/relatorios/views.py (adicionar action)
from core.permissions import IsAdmin

@action(detail=True, methods=['get', 'post', 'delete'], permission_classes=[IsAuthenticated, IsAdmin])
def permissoes(self, request, pk=None):
    relatorio = self.get_object()

    if request.method == 'GET':
        perms = relatorio.permissoes.select_related('usuario')
        data = [
            {
                'id': str(p.id),
                'usuario_id': str(p.usuario_id),
                'usuario_nome': p.usuario.nome,
                'usuario_email': p.usuario.email,
                'nivel': p.nivel
            }
            for p in perms
        ]
        return Response(data)

    elif request.method == 'POST':
        usuario_id = request.data.get('usuario_id')
        nivel = request.data.get('nivel', 'VISUALIZAR')

        Permissao.objects.update_or_create(
            relatorio=relatorio,
            usuario_id=usuario_id,
            defaults={
                'nivel': nivel,
                'criado_por': request.user
            }
        )
        return Response({'success': True})

    elif request.method == 'DELETE':
        usuario_id = request.data.get('usuario_id')
        Permissao.objects.filter(
            relatorio=relatorio,
            usuario_id=usuario_id
        ).delete()
        return Response({'success': True})
```

### 6. Serializer com Permissão

```python
# apps/relatorios/serializers.py (modificar)
class RelatorioListSerializer(serializers.ModelSerializer):
    conexao_nome = serializers.CharField(source='conexao.nome', read_only=True)
    pode_exportar = serializers.SerializerMethodField()

    class Meta:
        model = Relatorio
        fields = ['id', 'nome', 'descricao', 'conexao_nome', 'pode_exportar']

    def get_pode_exportar(self, obj):
        user = self.context['request'].user
        if user.role in ['ADMIN', 'TECNICO']:
            return True
        perm = obj.permissoes.filter(usuario=user).first()
        return perm and perm.nivel == 'EXPORTAR'
```

### 7. Frontend - Gestão de Permissões

```typescript
// frontend/src/components/PermissoesForm.tsx
import { useState, useEffect } from 'react'
import api from '../services/api'

interface Permissao {
  id: string
  usuario_id: string
  usuario_nome: string
  usuario_email: string
  nivel: 'VISUALIZAR' | 'EXPORTAR'
}

export default function PermissoesForm({ relatorioId }: { relatorioId: string }) {
  const [permissoes, setPermissoes] = useState<Permissao[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [novoUsuarioId, setNovoUsuarioId] = useState('')
  const [novoNivel, setNovoNivel] = useState('VISUALIZAR')

  useEffect(() => {
    api.get(`/relatorios/${relatorioId}/permissoes/`).then(res => setPermissoes(res.data))
    api.get('/usuarios/').then(res => setUsuarios(res.data))
  }, [relatorioId])

  async function adicionar() {
    await api.post(`/relatorios/${relatorioId}/permissoes/`, {
      usuario_id: novoUsuarioId,
      nivel: novoNivel
    })
    // Recarregar
    const res = await api.get(`/relatorios/${relatorioId}/permissoes/`)
    setPermissoes(res.data)
  }

  async function remover(usuarioId: string) {
    await api.delete(`/relatorios/${relatorioId}/permissoes/`, {
      data: { usuario_id: usuarioId }
    })
    setPermissoes(permissoes.filter(p => p.usuario_id !== usuarioId))
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Permissões</h3>
      <p className="text-slate-400 text-sm">Admin e Técnico sempre têm acesso total</p>

      {/* Lista de permissões */}
      {permissoes.map(p => (
        <div key={p.id} className="flex items-center justify-between bg-slate-700 p-3 rounded">
          <div>
            <span className="text-white">{p.usuario_nome}</span>
            <span className="text-slate-400 text-sm ml-2">({p.usuario_email})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded text-sm ${
              p.nivel === 'EXPORTAR' ? 'bg-green-600' : 'bg-blue-600'
            }`}>
              {p.nivel}
            </span>
            <button onClick={() => remover(p.usuario_id)} className="text-red-400">
              Remover
            </button>
          </div>
        </div>
      ))}

      {/* Adicionar novo */}
      <div className="flex gap-3 mt-4">
        <select
          value={novoUsuarioId}
          onChange={e => setNovoUsuarioId(e.target.value)}
          className="bg-slate-700 p-2 rounded text-white flex-1"
        >
          <option value="">Selecione usuário...</option>
          {usuarios.filter(u => u.role === 'USUARIO').map(u => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>
        <select
          value={novoNivel}
          onChange={e => setNovoNivel(e.target.value)}
          className="bg-slate-700 p-2 rounded text-white"
        >
          <option value="VISUALIZAR">Visualizar</option>
          <option value="EXPORTAR">Exportar</option>
        </select>
        <button
          onClick={adicionar}
          disabled={!novoUsuarioId}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Adicionar
        </button>
      </div>
    </div>
  )
}
```

### 8. Frontend - Esconder Botão Exportar

```typescript
// frontend/src/pages/ExecutarRelatorio.tsx (modificar)
// Adicionar prop pode_exportar ao buscar relatório

{resultado?.sucesso && relatorio.pode_exportar && (
  <button onClick={exportar} className="bg-blue-600 text-white px-4 py-2 rounded">
    Exportar Excel
  </button>
)}
```

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `backend/apps/relatorios/models.py` | Modificar (add Permissao) |
| `backend/services/permissoes.py` | Criar |
| `backend/apps/relatorios/views.py` | Modificar |
| `backend/apps/relatorios/serializers.py` | Modificar |
| `frontend/src/components/PermissoesForm.tsx` | Criar |
| `frontend/src/pages/ExecutarRelatorio.tsx` | Modificar |
| `frontend/src/pages/RelatorioForm.tsx` | Modificar (add tab) |

## Critérios de Conclusão

- [ ] Admin vê todos os relatórios
- [ ] Técnico vê todos os relatórios
- [ ] Usuário só vê relatórios com permissão
- [ ] Adicionar permissão funciona
- [ ] Remover permissão funciona
- [ ] Alterar nível de permissão funciona
- [ ] Usuário sem permissão Exportar não vê botão
- [ ] API de exportar retorna 403 para quem não pode
- [ ] Apenas Admin pode gerenciar permissões

## Testes Manuais

```bash
# 1. Criar usuário "Maria" (role: USUARIO)
# 2. Criar relatório "Vendas"
# 3. Logar como Maria
# 4. Verificar que NÃO vê "Vendas"
# 5. Logar como Admin
# 6. Adicionar Maria com permissão "Visualizar"
# 7. Logar como Maria
# 8. Verificar que VÊ "Vendas"
# 9. Executar funciona
# 10. Botão Exportar NÃO aparece
# 11. Admin altera Maria para "Exportar"
# 12. Maria agora vê botão e consegue exportar
```
