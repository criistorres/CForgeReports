# Fase 05 - Permissões

## Objetivo

Implementar controle de acesso: quais usuários podem ver/executar/exportar cada relatório.

## Contexto

- Relatórios com filtros funcionando (Fase 4 completa)
- Atualmente todos veem todos os relatórios da empresa
- Após esta fase: usuário só vê relatórios com permissão explícita

## Dependências

- Fase 4 completa (filtros)

## Casos de Uso Relacionados

- [UC06 - Permissões](../casos-de-uso/UC06-permissoes.md)

## Entregas

### 1. Modelo Prisma

```prisma
// Adicionar ao schema.prisma
model Permissao {
  id            String          @id @default(cuid())
  relatorioId   String
  usuarioId     String
  nivel         NivelPermissao
  criadoPorId   String
  criadoEm      DateTime        @default(now())

  relatorio     Relatorio       @relation(fields: [relatorioId], references: [id], onDelete: Cascade)
  usuario       Usuario         @relation("PermissoesRecebidas", fields: [usuarioId], references: [id])
  criadoPor     Usuario         @relation("PermissoesCriadas", fields: [criadoPorId], references: [id])

  @@unique([relatorioId, usuarioId])
}

enum NivelPermissao {
  VISUALIZAR  // Pode ver e executar
  EXPORTAR    // Pode ver, executar e exportar
}
```

### 2. Atualizar Usuario e Relatorio

```prisma
model Usuario {
  // ... campos existentes
  permissoesRecebidas  Permissao[]  @relation("PermissoesRecebidas")
  permissoesCriadas    Permissao[]  @relation("PermissoesCriadas")
}

model Relatorio {
  // ... campos existentes
  permissoes           Permissao[]
}
```

### 3. Serviço de Verificação de Permissão

```typescript
// src/lib/permissoes/index.ts
import { prisma } from '../db'
import { Role, NivelPermissao } from '@prisma/client'

interface PermissaoUsuario {
  temAcesso: boolean
  podeExportar: boolean
}

export async function verificarPermissao(
  relatorioId: string,
  usuarioId: string,
  role: Role
): Promise<PermissaoUsuario> {
  // Admin e Técnico sempre têm acesso total
  if (role === 'ADMIN' || role === 'TECNICO') {
    return { temAcesso: true, podeExportar: true }
  }

  // Buscar permissão explícita
  const permissao = await prisma.permissao.findUnique({
    where: {
      relatorioId_usuarioId: {
        relatorioId,
        usuarioId
      }
    }
  })

  if (!permissao) {
    return { temAcesso: false, podeExportar: false }
  }

  return {
    temAcesso: true,
    podeExportar: permissao.nivel === 'EXPORTAR'
  }
}
```

### 4. Atualizar Listagem de Relatórios

```typescript
// src/app/api/relatorios/route.ts
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { empresaId, role, id: usuarioId } = session.user

  let where: any = {
    empresaId,
    ativo: true
  }

  // Se não é Admin/Técnico, filtrar por permissão
  if (role === 'USUARIO') {
    where = {
      ...where,
      permissoes: {
        some: {
          usuarioId
        }
      }
    }
  }

  const relatorios = await prisma.relatorio.findMany({
    where,
    include: {
      conexao: { select: { nome: true } },
      // Incluir permissão do usuário atual
      permissoes: {
        where: { usuarioId },
        select: { nivel: true }
      }
    }
  })

  // Mapear para incluir flag de export
  const relatoriosComPermissao = relatorios.map(r => ({
    ...r,
    podeExportar: role !== 'USUARIO' || r.permissoes[0]?.nivel === 'EXPORTAR'
  }))

  return Response.json(relatoriosComPermissao)
}
```

### 5. Proteger Execução

```typescript
// src/app/api/relatorios/[id]/executar/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Verificar permissão
  const permissao = await verificarPermissao(
    params.id,
    session.user.id,
    session.user.role
  )

  if (!permissao.temAcesso) {
    return Response.json({ error: 'Sem permissão' }, { status: 403 })
  }

  // ... executar
}
```

### 6. Proteger Exportação

```typescript
// src/app/api/relatorios/[id]/exportar/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const permissao = await verificarPermissao(
    params.id,
    session.user.id,
    session.user.role
  )

  if (!permissao.podeExportar) {
    return Response.json({ error: 'Sem permissão para exportar' }, { status: 403 })
  }

  // ... exportar
}
```

### 7. API de Permissões

```typescript
// src/app/api/relatorios/[id]/permissoes/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Listar permissões do relatório
  // Apenas Admin pode ver
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Adicionar permissão
  // Apenas Admin pode fazer
  const { usuarioId, nivel } = await request.json()

  await prisma.permissao.create({
    data: {
      relatorioId: params.id,
      usuarioId,
      nivel,
      criadoPorId: session.user.id
    }
  })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // Remover permissão
  const { usuarioId } = await request.json()

  await prisma.permissao.delete({
    where: {
      relatorioId_usuarioId: {
        relatorioId: params.id,
        usuarioId
      }
    }
  })
}
```

### 8. Interface - Aba Permissões no Editor

```
┌─────────────────────────────────────────────────────────┐
│ Relatório: Vendas Diárias                               │
│ [Dados] [Filtros] [Permissões]                          │
├─────────────────────────────────────────────────────────┤
│                                   [+ Adicionar Usuário] │
│                                                         │
│ Usuário         │ Nível      │ Ações                   │
│ Maria Santos    │ Exportar   │ [Alterar] [Remover]     │
│ Pedro Lima      │ Visualizar │ [Alterar] [Remover]     │
│                                                         │
│ ℹ️ Admin e Técnico sempre têm acesso total              │
└─────────────────────────────────────────────────────────┘
```

### 9. Interface - Esconder Botão Exportar

Na tela de execução, esconder botão "Exportar Excel" se usuário não tem permissão.

```tsx
{podeExportar && (
  <button onClick={handleExportar}>Exportar Excel</button>
)}
```

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `prisma/schema.prisma` | Modificar (add Permissao) |
| `src/lib/permissoes/index.ts` | Criar |
| `src/app/api/relatorios/route.ts` | Modificar (filtrar por permissão) |
| `src/app/api/relatorios/[id]/executar/route.ts` | Modificar (verificar permissão) |
| `src/app/api/relatorios/[id]/exportar/route.ts` | Modificar (verificar permissão) |
| `src/app/api/relatorios/[id]/permissoes/route.ts` | Criar |
| `src/app/(dashboard)/relatorios/[id]/page.tsx` | Modificar (add aba permissões) |
| `src/components/features/permissoes-form.tsx` | Criar |
| `src/app/(dashboard)/relatorios/[id]/executar/page.tsx` | Modificar (esconder export) |

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
# Preparação
1. Criar 2 usuários: Maria (Usuário) e Pedro (Usuário)
2. Criar relatório "Vendas"

# Teste permissão
3. Logar como Maria
4. Verificar que não vê "Vendas" na lista
5. Logar como Admin
6. Adicionar Maria com permissão "Visualizar"
7. Logar como Maria
8. Verificar que vê "Vendas"
9. Executar funciona
10. Botão Exportar não aparece
11. Logar como Admin
12. Alterar Maria para "Exportar"
13. Logar como Maria
14. Botão Exportar aparece
15. Exportar funciona
```

## Notas

- Permissão é por relatório, não por pasta (simplificação)
- Fase futura pode adicionar permissão por pasta
- Considerar cache de permissões se performance for problema
