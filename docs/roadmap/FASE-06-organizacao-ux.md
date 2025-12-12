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

### 1. Modelo Prisma - Pastas

```prisma
model Pasta {
  id            String    @id @default(cuid())
  empresaId     String
  nome          String
  pastaPaiId    String?   // Hierarquia
  criadoEm      DateTime  @default(now())
  atualizadoEm  DateTime  @updatedAt

  empresa       Empresa   @relation(fields: [empresaId], references: [id])
  pastaPai      Pasta?    @relation("Subpastas", fields: [pastaPaiId], references: [id])
  subpastas     Pasta[]   @relation("Subpastas")
  relatorios    Relatorio[]

  @@unique([empresaId, pastaPaiId, nome])
}
```

### 2. Modelo Prisma - Favoritos

```prisma
model Favorito {
  id            String    @id @default(cuid())
  usuarioId     String
  relatorioId   String
  criadoEm      DateTime  @default(now())

  usuario       Usuario   @relation(fields: [usuarioId], references: [id])
  relatorio     Relatorio @relation(fields: [relatorioId], references: [id])

  @@unique([usuarioId, relatorioId])
}
```

### 3. Atualizar Relatorio

```prisma
model Relatorio {
  // ... campos existentes
  pastaId       String?
  pasta         Pasta?    @relation(fields: [pastaId], references: [id])
  favoritos     Favorito[]
}
```

### 4. API de Pastas

```typescript
// src/app/api/pastas/route.ts
// GET - listar pastas (árvore)
// POST - criar pasta

// src/app/api/pastas/[id]/route.ts
// PUT - renomear pasta
// DELETE - excluir pasta (se vazia)
```

### 5. API de Favoritos

```typescript
// src/app/api/favoritos/route.ts
export async function GET() {
  // Listar favoritos do usuário logado
  const session = await getServerSession(authOptions)

  const favoritos = await prisma.favorito.findMany({
    where: { usuarioId: session.user.id },
    include: {
      relatorio: {
        select: { id: true, nome: true, descricao: true }
      }
    }
  })

  return Response.json(favoritos)
}

export async function POST(request: Request) {
  // Adicionar favorito
  const { relatorioId } = await request.json()

  await prisma.favorito.create({
    data: {
      usuarioId: session.user.id,
      relatorioId
    }
  })
}

export async function DELETE(request: Request) {
  // Remover favorito
  const { relatorioId } = await request.json()

  await prisma.favorito.delete({
    where: {
      usuarioId_relatorioId: {
        usuarioId: session.user.id,
        relatorioId
      }
    }
  })
}
```

### 6. Interface de Histórico

```typescript
// src/app/api/historico/route.ts
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(request.url)

  const filtros = {
    relatorioId: searchParams.get('relatorioId'),
    usuarioId: searchParams.get('usuarioId'),
    dataInicio: searchParams.get('dataInicio'),
    dataFim: searchParams.get('dataFim'),
    sucesso: searchParams.get('sucesso')
  }

  let where: any = { empresaId: session.user.empresaId }

  // Usuário só vê seu próprio histórico
  if (session.user.role === 'USUARIO') {
    where.usuarioId = session.user.id
  } else if (filtros.usuarioId) {
    where.usuarioId = filtros.usuarioId
  }

  // Aplicar outros filtros...

  const execucoes = await prisma.execucao.findMany({
    where,
    include: {
      relatorio: { select: { nome: true } },
      usuario: { select: { nome: true } }
    },
    orderBy: { iniciadoEm: 'desc' },
    take: 100
  })

  return Response.json(execucoes)
}
```

### 7. Dashboard do Usuário

```
┌─────────────────────────────────────────────────────────┐
│ Olá, Maria!                                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ⭐ Meus Favoritos                                       │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│ │ ⭐ Vendas    │ │ ⭐ Estoque   │ │ ⭐ Clientes  │     │
│ │    Diárias   │ │    Atual     │ │    Novos     │     │
│ └──────────────┘ └──────────────┘ └──────────────┘     │
│                                                         │
│ 🕐 Execuções Recentes                                   │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Vendas Diárias │ Hoje 14:30 │ ✓ │ [Re-executar]    ││
│ │ Estoque Atual  │ Hoje 14:15 │ ✓ │ [Re-executar]    ││
│ │ Vendas Diárias │ Ontem 17:00│ ✓ │ [Re-executar]    ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ 📁 Relatórios por Pasta                                │
│ ├── 📁 Financeiro                                      │
│ │   ├── Contas a Pagar                                │
│ │   └── Contas a Receber                              │
│ ├── 📁 Vendas                                          │
│ │   ├── Vendas Diárias                                │
│ │   └── Vendas Mensais                                │
│ └── 📄 Estoque Atual (sem pasta)                       │
└─────────────────────────────────────────────────────────┘
```

### 8. Busca de Relatórios

```typescript
// Adicionar à API de relatórios
const busca = searchParams.get('busca')

if (busca) {
  where = {
    ...where,
    OR: [
      { nome: { contains: busca, mode: 'insensitive' } },
      { descricao: { contains: busca, mode: 'insensitive' } }
    ]
  }
}
```

### 9. Re-executar do Histórico

```typescript
// src/app/api/historico/[id]/reexecutar/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Buscar execução
  const execucao = await prisma.execucao.findUnique({
    where: { id: params.id }
  })

  // Redirecionar para execução com filtros pré-preenchidos
  return Response.json({
    relatorioId: execucao.relatorioId,
    filtros: JSON.parse(execucao.filtrosUsados || '{}')
  })
}
```

### 10. Tela de Histórico (Admin)

```
┌─────────────────────────────────────────────────────────────────┐
│ Histórico de Execuções                                          │
├─────────────────────────────────────────────────────────────────┤
│ Filtros:                                                        │
│ [Todos relatórios ▼] [Todos usuários ▼] [Últimos 7 dias ▼]     │
│ [🔍 Buscar...]                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Data/Hora        │ Relatório      │ Usuário │ Status │ Tempo   │
│ 15/01 14:30:22   │ Vendas Diárias │ Maria   │ ✓      │ 1.2s    │
│ 15/01 14:28:15   │ Estoque        │ Pedro   │ ✓      │ 0.8s    │
│ 15/01 14:25:00   │ Vendas Diárias │ Maria   │ ✗ Erro │ 30s     │
│                                                                 │
│                              [◀ Anterior] [Próximo ▶]          │
└─────────────────────────────────────────────────────────────────┘
```

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `prisma/schema.prisma` | Modificar (add Pasta, Favorito) |
| `src/app/api/pastas/route.ts` | Criar |
| `src/app/api/pastas/[id]/route.ts` | Criar |
| `src/app/api/favoritos/route.ts` | Criar |
| `src/app/api/historico/route.ts` | Criar |
| `src/app/api/historico/[id]/route.ts` | Criar |
| `src/app/api/relatorios/route.ts` | Modificar (add busca) |
| `src/app/(dashboard)/dashboard/page.tsx` | Modificar (novo layout) |
| `src/app/(dashboard)/historico/page.tsx` | Criar |
| `src/components/features/pasta-tree.tsx` | Criar |
| `src/components/features/favorito-button.tsx` | Criar |
| `src/components/features/busca-relatorios.tsx` | Criar |

## Critérios de Conclusão

- [ ] Criar pasta funciona
- [ ] Mover relatório para pasta funciona
- [ ] Adicionar/remover favorito funciona
- [ ] Dashboard mostra favoritos
- [ ] Dashboard mostra histórico recente
- [ ] Busca de relatórios funciona
- [ ] Histórico filtra por relatório/usuário/data
- [ ] Re-executar preenche filtros automaticamente
- [ ] Usuário só vê seu próprio histórico
- [ ] Admin vê histórico de todos

## Testes Manuais

```bash
# Pastas
1. Criar pasta "Financeiro"
2. Mover relatório para pasta
3. Ver organização na lista

# Favoritos
4. Clicar estrela em relatório
5. Ver no dashboard em Favoritos
6. Remover favorito

# Busca
7. Digitar parte do nome na busca
8. Ver resultados filtrados

# Histórico
9. Executar alguns relatórios
10. Acessar histórico
11. Filtrar por relatório
12. Clicar re-executar
13. Ver filtros pré-preenchidos
```

## Notas

- Esta fase completa o "Marco 2 - Produto Básico"
- Após esta fase, sistema está pronto para clientes pagantes
- Fases futuras são melhorias incrementais
