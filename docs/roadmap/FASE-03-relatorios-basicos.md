# Fase 03 - Relatórios Básicos

## Objetivo

Criar e executar relatórios (query SQL) com exportação para Excel. **Sem filtros ainda.**

## Contexto

- Conexões funcionando (Fase 2 completa)
- Pelo menos uma conexão cadastrada para testes
- Esta fase entrega o MVP funcional end-to-end

## Dependências

- Fase 2 completa (conexões)

## Casos de Uso Relacionados

- [UC04 - Criação de Relatório](../casos-de-uso/UC04-criacao-relatorio.md)
- [UC07 - Consumo de Relatório](../casos-de-uso/UC07-consumo-relatorio.md)

## Entregas

### 1. Modelo Prisma

```prisma
// Adicionar ao schema.prisma
model Relatorio {
  id              String    @id @default(cuid())
  empresaId       String
  conexaoId       String
  nome            String
  descricao       String?
  querySql        String
  ativo           Boolean   @default(true)
  limiteLinhasTela Int      @default(1000)
  permiteExportar Boolean   @default(true)
  criadoPorId     String
  criadoEm        DateTime  @default(now())
  atualizadoEm    DateTime  @updatedAt

  empresa         Empresa   @relation(fields: [empresaId], references: [id])
  conexao         Conexao   @relation(fields: [conexaoId], references: [id])
  criadoPor       Usuario   @relation(fields: [criadoPorId], references: [id])
  execucoes       Execucao[]

  @@unique([empresaId, nome])
}

model Execucao {
  id              String    @id @default(cuid())
  empresaId       String
  relatorioId     String
  usuarioId       String
  filtrosUsados   String?   // JSON (null nesta fase)
  iniciadoEm      DateTime  @default(now())
  finalizadoEm    DateTime?
  tempoExecucaoMs Int?
  sucesso         Boolean   @default(false)
  erro            String?
  qtdLinhas       Int?
  exportou        Boolean   @default(false)
  exportadoEm     DateTime?

  empresa         Empresa   @relation(fields: [empresaId], references: [id])
  relatorio       Relatorio @relation(fields: [relatorioId], references: [id])
  usuario         Usuario   @relation(fields: [usuarioId], references: [id])
}
```

### 2. Validação de Query

```typescript
// src/lib/query-validator.ts
const BLOCKED_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE',
  'ALTER', 'CREATE', 'EXEC', 'EXECUTE', 'GRANT', 'REVOKE',
  'BACKUP', 'RESTORE', 'SHUTDOWN'
]

export function validarQuery(query: string): { valida: boolean; erro?: string } {
  const queryUpper = query.toUpperCase().trim()

  // Remover comentários
  const querySemComentarios = queryUpper
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim()

  // Deve começar com SELECT
  if (!querySemComentarios.startsWith('SELECT')) {
    return { valida: false, erro: 'Query deve começar com SELECT' }
  }

  // Verificar keywords bloqueadas
  for (const keyword of BLOCKED_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i')
    if (regex.test(querySemComentarios)) {
      return { valida: false, erro: `Comando ${keyword} não é permitido` }
    }
  }

  return { valida: true }
}
```

### 3. Serviço de Execução

```typescript
// src/lib/relatorios/executar.ts
import { executarQuery } from '../connections'
import { prisma } from '../db'

interface ResultadoExecucao {
  sucesso: boolean
  dados?: any[]
  colunas?: string[]
  totalLinhas?: number
  tempoMs?: number
  erro?: string
}

export async function executarRelatorio(
  relatorioId: string,
  usuarioId: string,
  empresaId: string,
  limite?: number
): Promise<ResultadoExecucao> {
  const inicio = Date.now()

  // Buscar relatório
  const relatorio = await prisma.relatorio.findFirst({
    where: { id: relatorioId, empresaId, ativo: true }
  })

  if (!relatorio) {
    return { sucesso: false, erro: 'Relatório não encontrado' }
  }

  // Criar registro de execução
  const execucao = await prisma.execucao.create({
    data: {
      empresaId,
      relatorioId,
      usuarioId,
      iniciadoEm: new Date()
    }
  })

  try {
    // Executar query
    const resultado = await executarQuery(
      relatorio.conexaoId,
      relatorio.querySql,
      limite || relatorio.limiteLinhasTela
    )

    const tempoMs = Date.now() - inicio

    // Atualizar execução
    await prisma.execucao.update({
      where: { id: execucao.id },
      data: {
        finalizadoEm: new Date(),
        tempoExecucaoMs: tempoMs,
        sucesso: true,
        qtdLinhas: resultado.dados.length
      }
    })

    return {
      sucesso: true,
      dados: resultado.dados,
      colunas: resultado.colunas,
      totalLinhas: resultado.totalLinhas,
      tempoMs
    }
  } catch (error: any) {
    const tempoMs = Date.now() - inicio

    await prisma.execucao.update({
      where: { id: execucao.id },
      data: {
        finalizadoEm: new Date(),
        tempoExecucaoMs: tempoMs,
        sucesso: false,
        erro: error.message
      }
    })

    return { sucesso: false, erro: error.message }
  }
}
```

### 4. Exportação Excel

```typescript
// src/lib/relatorios/exportar.ts
import * as XLSX from 'xlsx'

export function gerarExcel(dados: any[], colunas: string[]): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(dados)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados')

  // Auto-dimensionar colunas
  const maxWidths = colunas.map((col, i) => {
    const maxLen = Math.max(
      col.length,
      ...dados.map(row => String(row[col] || '').length)
    )
    return { wch: Math.min(maxLen + 2, 50) }
  })
  worksheet['!cols'] = maxWidths

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}
```

### 5. APIs

```typescript
// src/app/api/relatorios/route.ts
// GET - listar relatórios
// POST - criar relatório

// src/app/api/relatorios/[id]/route.ts
// GET - detalhes do relatório
// PUT - atualizar relatório
// DELETE - desativar relatório

// src/app/api/relatorios/[id]/executar/route.ts
// POST - executar relatório

// src/app/api/relatorios/[id]/exportar/route.ts
// POST - exportar para Excel
```

### 6. Interface - Lista de Relatórios

```
┌────────────────────────────────────────────────────────┐
│ Relatórios                          [+ Novo Relatório] │
├────────────────────────────────────────────────────────┤
│ 🔍 Buscar...                                           │
├────────────────────────────────────────────────────────┤
│ Nome              │ Conexão    │ Ações               │
│ Vendas Diárias    │ Produção   │ [Executar] [Editar] │
│ Estoque Atual     │ Produção   │ [Executar] [Editar] │
└────────────────────────────────────────────────────────┘
```

### 7. Interface - Criar/Editar Relatório

Editor de query com:
- Campo nome
- Campo descrição
- Select de conexão
- Editor SQL (pode ser textarea simples inicialmente)
- Botão testar (executa com LIMIT 10)
- Preview do resultado

### 8. Interface - Executar Relatório

```
┌────────────────────────────────────────────────────────┐
│ ← Voltar                            Vendas Diárias     │
├────────────────────────────────────────────────────────┤
│                                          [Executar]    │
├────────────────────────────────────────────────────────┤
│ Resultado (1.000 de 5.432)         [Exportar Excel]    │
│ ┌────────────────────────────────────────────────────┐│
│ │ Data       │ Cliente    │ Valor     │ ...         ││
│ │ 15/01/2024 │ Acme Corp  │ 1.500,00  │             ││
│ │ ...        │ ...        │ ...       │             ││
│ └────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────┘
```

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `prisma/schema.prisma` | Modificar (add Relatorio, Execucao) |
| `src/lib/query-validator.ts` | Criar |
| `src/lib/relatorios/executar.ts` | Criar |
| `src/lib/relatorios/exportar.ts` | Criar |
| `src/app/api/relatorios/route.ts` | Criar |
| `src/app/api/relatorios/[id]/route.ts` | Criar |
| `src/app/api/relatorios/[id]/executar/route.ts` | Criar |
| `src/app/api/relatorios/[id]/exportar/route.ts` | Criar |
| `src/app/(dashboard)/relatorios/page.tsx` | Criar |
| `src/app/(dashboard)/relatorios/novo/page.tsx` | Criar |
| `src/app/(dashboard)/relatorios/[id]/page.tsx` | Criar |
| `src/app/(dashboard)/relatorios/[id]/executar/page.tsx` | Criar |
| `src/components/features/relatorio-form.tsx` | Criar |
| `src/components/features/resultado-tabela.tsx` | Criar |

## Critérios de Conclusão

- [ ] CRUD de relatórios funciona
- [ ] Query com INSERT/DELETE é bloqueada
- [ ] Testar query mostra preview
- [ ] Executar query retorna dados
- [ ] Tabela exibe resultado formatado
- [ ] Limite de linhas em tela funciona
- [ ] Exportar Excel funciona
- [ ] Nome do arquivo Excel correto
- [ ] Execução é registrada no banco
- [ ] Erro mostra mensagem amigável

## Testes Manuais (Fluxo E2E)

```bash
# 1. Logar como técnico
# 2. Criar conexão (se não tiver)
# 3. Criar relatório com query simples
# 4. Testar query no editor
# 5. Salvar relatório
# 6. Ir para lista de relatórios
# 7. Clicar em Executar
# 8. Ver resultado na tabela
# 9. Clicar em Exportar Excel
# 10. Verificar arquivo baixado
```

## Notas

- Esta fase NÃO implementa filtros (Fase 4)
- Esta fase NÃO implementa permissões (Fase 5)
- Todos veem todos os relatórios da empresa por enquanto
- Foco em ter o fluxo funcionando end-to-end
