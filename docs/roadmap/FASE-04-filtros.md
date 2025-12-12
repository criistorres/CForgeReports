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

### 1. Modelo Prisma

```prisma
// Adicionar ao schema.prisma
model Filtro {
  id            String      @id @default(cuid())
  relatorioId   String
  parametro     String      // @data_inicio
  label         String      // "Data Início"
  tipo          TipoFiltro
  obrigatorio   Boolean     @default(false)
  valorPadrao   String?
  opcoes        String?     // JSON para tipo LISTA: ["op1", "op2"]
  ordem         Int         @default(0)
  criadoEm      DateTime    @default(now())
  atualizadoEm  DateTime    @updatedAt

  relatorio     Relatorio   @relation(fields: [relatorioId], references: [id], onDelete: Cascade)

  @@unique([relatorioId, parametro])
}

enum TipoFiltro {
  DATA
  TEXTO
  NUMERO
  LISTA
}
```

### 2. Atualizar Relatorio

```prisma
model Relatorio {
  // ... campos existentes
  filtros       Filtro[]
}
```

### 3. API de Filtros

```typescript
// src/app/api/relatorios/[id]/filtros/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const filtroSchema = z.object({
  parametro: z.string().min(1),
  label: z.string().min(1),
  tipo: z.enum(['DATA', 'TEXTO', 'NUMERO', 'LISTA']),
  obrigatorio: z.boolean(),
  valorPadrao: z.string().optional(),
  opcoes: z.array(z.string()).optional(),
  ordem: z.number().int()
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const filtros = await prisma.filtro.findMany({
    where: {
      relatorioId: params.id,
      relatorio: { empresaId: session.user.empresaId }
    },
    orderBy: { ordem: 'asc' }
  })

  return Response.json(filtros)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'TECNICO'].includes(session.user.role)) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const filtros = z.array(filtroSchema).parse(body)

  // Deletar filtros existentes e recriar
  await prisma.filtro.deleteMany({
    where: { relatorioId: params.id }
  })

  await prisma.filtro.createMany({
    data: filtros.map(f => ({
      relatorioId: params.id,
      parametro: f.parametro,
      label: f.label,
      tipo: f.tipo,
      obrigatorio: f.obrigatorio,
      valorPadrao: f.valorPadrao || null,
      opcoes: f.opcoes ? JSON.stringify(f.opcoes) : null,
      ordem: f.ordem
    }))
  })

  return Response.json({ success: true })
}
```

### 4. Substituição de Parâmetros

```typescript
// src/lib/relatorios/parametros.ts
import { TipoFiltro } from '@prisma/client'

interface Filtro {
  parametro: string
  tipo: TipoFiltro
  obrigatorio: boolean
}

interface ValoresFiltros {
  [parametro: string]: string | number | Date | null
}

export function substituirParametros(
  query: string,
  filtros: Filtro[],
  valores: ValoresFiltros
): { query: string; erro?: string } {
  let queryFinal = query

  for (const filtro of filtros) {
    const valor = valores[filtro.parametro]

    // Validar obrigatórios
    if (filtro.obrigatorio && (valor === null || valor === undefined || valor === '')) {
      return { query: '', erro: `Filtro ${filtro.parametro} é obrigatório` }
    }

    // Substituir na query
    const placeholder = filtro.parametro // @data_inicio
    let valorFormatado: string

    if (valor === null || valor === undefined || valor === '') {
      valorFormatado = 'NULL'
    } else if (filtro.tipo === 'DATA') {
      valorFormatado = `'${formatarData(valor)}'`
    } else if (filtro.tipo === 'TEXTO') {
      valorFormatado = `'${escaparString(String(valor))}'`
    } else if (filtro.tipo === 'NUMERO') {
      valorFormatado = String(Number(valor))
    } else if (filtro.tipo === 'LISTA') {
      valorFormatado = `'${escaparString(String(valor))}'`
    } else {
      valorFormatado = `'${escaparString(String(valor))}'`
    }

    queryFinal = queryFinal.replace(
      new RegExp(placeholder, 'g'),
      valorFormatado
    )
  }

  return { query: queryFinal }
}

function formatarData(valor: any): string {
  const data = new Date(valor)
  return data.toISOString().split('T')[0] // YYYY-MM-DD
}

function escaparString(valor: string): string {
  return valor.replace(/'/g, "''")
}
```

### 5. Atualizar Execução

```typescript
// src/lib/relatorios/executar.ts
export async function executarRelatorio(
  relatorioId: string,
  usuarioId: string,
  empresaId: string,
  valoresFiltros?: ValoresFiltros, // NOVO
  limite?: number
): Promise<ResultadoExecucao> {
  // ...

  // Buscar filtros do relatório
  const filtros = await prisma.filtro.findMany({
    where: { relatorioId }
  })

  // Substituir parâmetros
  let queryFinal = relatorio.querySql
  if (filtros.length > 0 && valoresFiltros) {
    const resultado = substituirParametros(queryFinal, filtros, valoresFiltros)
    if (resultado.erro) {
      return { sucesso: false, erro: resultado.erro }
    }
    queryFinal = resultado.query
  }

  // Criar execução com filtros usados
  const execucao = await prisma.execucao.create({
    data: {
      empresaId,
      relatorioId,
      usuarioId,
      filtrosUsados: valoresFiltros ? JSON.stringify(valoresFiltros) : null,
      iniciadoEm: new Date()
    }
  })

  // ... resto da execução
}
```

### 6. Interface - Aba Filtros no Editor

```
┌─────────────────────────────────────────────────────────┐
│ Relatório: Vendas por Período                           │
│ [Dados] [Filtros]                                       │
├─────────────────────────────────────────────────────────┤
│                                    [+ Adicionar Filtro] │
│                                                         │
│ ☰ │ @data_inicio │ Data Início │ Data   │ Obrigatório │
│ ☰ │ @data_fim    │ Data Fim    │ Data   │ Obrigatório │
│ ☰ │ @vendedor    │ Vendedor    │ Lista  │ Opcional    │
│                                                         │
│                                           [Salvar]      │
└─────────────────────────────────────────────────────────┘
```

### 7. Interface - Filtros na Execução

```
┌─────────────────────────────────────────────────────────┐
│ ← Voltar                          Vendas por Período    │
├─────────────────────────────────────────────────────────┤
│ Filtros:                                                │
│ Data Início*: [    📅    ] Data Fim*: [    📅    ]     │
│ Vendedor:     [Selecione... ▼]                          │
│                                                         │
│                                          [Executar]     │
├─────────────────────────────────────────────────────────┤
│ (resultado aparece aqui após executar)                  │
└─────────────────────────────────────────────────────────┘
```

### 8. Componentes de Input por Tipo

```typescript
// src/components/features/filtro-input.tsx
interface FiltroInputProps {
  filtro: Filtro
  valor: any
  onChange: (valor: any) => void
}

export function FiltroInput({ filtro, valor, onChange }: FiltroInputProps) {
  switch (filtro.tipo) {
    case 'DATA':
      return <input type="date" value={valor} onChange={e => onChange(e.target.value)} />

    case 'TEXTO':
      return <input type="text" value={valor} onChange={e => onChange(e.target.value)} />

    case 'NUMERO':
      return <input type="number" value={valor} onChange={e => onChange(e.target.value)} />

    case 'LISTA':
      const opcoes = JSON.parse(filtro.opcoes || '[]')
      return (
        <select value={valor} onChange={e => onChange(e.target.value)}>
          <option value="">Selecione...</option>
          {opcoes.map((op: string) => (
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
| `prisma/schema.prisma` | Modificar (add Filtro) |
| `src/lib/relatorios/parametros.ts` | Criar |
| `src/lib/relatorios/executar.ts` | Modificar |
| `src/app/api/relatorios/[id]/filtros/route.ts` | Criar |
| `src/app/api/relatorios/[id]/executar/route.ts` | Modificar |
| `src/components/features/filtro-form.tsx` | Criar |
| `src/components/features/filtro-input.tsx` | Criar |
| `src/app/(dashboard)/relatorios/[id]/page.tsx` | Modificar (add aba filtros) |
| `src/app/(dashboard)/relatorios/[id]/executar/page.tsx` | Modificar (add inputs) |

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
- [ ] Valor padrão preenche automaticamente

## Testes Manuais

```bash
# 1. Editar relatório existente
# 2. Ir na aba Filtros
# 3. Adicionar filtro @data (tipo Data, obrigatório)
# 4. Adicionar filtro @status (tipo Lista: ["Ativo", "Inativo"])
# 5. Salvar
# 6. Ir para Executar
# 7. Ver inputs de filtro
# 8. Tentar executar sem preencher data (deve dar erro)
# 9. Preencher e executar
# 10. Verificar que query executou com valores corretos
```

## Notas

- SQL Injection: usar escape de strings, não prepared statements ainda
- Prepared statements seria mais seguro, mas complexidade maior
- Fase futura pode melhorar segurança com parameterized queries
