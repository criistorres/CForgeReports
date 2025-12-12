# Decisões Técnicas

## Stack Definida

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Frontend** | Next.js 14 (React) | SSR, App Router, boa DX |
| **Estilo** | Tailwind CSS | Já usado no protótipo |
| **Backend** | Next.js API Routes | Fullstack simplificado |
| **ORM** | Prisma | Type-safe, migrations fáceis |
| **Banco Sistema** | PostgreSQL | Robusto, JSON support |
| **Auth** | NextAuth.js | Integrado com Next.js |
| **Conexões Externas** | Libs nativas | pg, mssql, mysql2 |

## Estrutura do Projeto

```
forge-reports/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rotas públicas (login)
│   │   ├── (dashboard)/       # Rotas autenticadas
│   │   ├── api/               # API Routes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # Componentes base (button, input)
│   │   └── features/          # Componentes de negócio
│   ├── lib/
│   │   ├── db/                # Prisma client, queries
│   │   ├── auth/              # Configuração NextAuth
│   │   └── connections/       # Lógica de conexão externa
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
└── tests/
```

## Modelo de Dados (Resumo)

```
Empresa (tenant)
├── Usuario (pertence a 1 empresa)
├── Conexao (pertence a 1 empresa)
├── Pasta (pertence a 1 empresa, hierárquica)
└── Relatorio (pertence a 1 empresa)
    ├── Filtro (pertence a 1 relatório)
    ├── Permissao (usuário + relatório)
    └── Execucao (log de execução)
```

## Multi-Tenancy

**Estratégia**: Coluna `empresa_id` em todas as tabelas

```typescript
// Toda query DEVE filtrar por empresa
const relatorios = await prisma.relatorio.findMany({
  where: {
    empresaId: session.user.empresaId  // OBRIGATÓRIO
  }
})
```

## Autenticação

**Fluxo**:
1. Login com email/senha
2. NextAuth gera session JWT
3. JWT contém: `userId`, `empresaId`, `role`
4. Middleware valida em toda request

**Roles**:
- `ADMIN` - Tudo
- `TECNICO` - Conexões e relatórios
- `USUARIO` - Apenas consumir

## Conexões Externas (Bancos dos Clientes)

```typescript
// Cada conexão é isolada, criada sob demanda
async function executeQuery(conexaoId: string, query: string, params: any[]) {
  const conexao = await getConexao(conexaoId)
  const pool = await createPool(conexao) // Pool temporário

  try {
    const result = await pool.query(query, params)
    return result
  } finally {
    await pool.close() // Sempre fechar
  }
}
```

**Segurança**:
- Senhas criptografadas com AES-256
- Timeout de 30 segundos
- Apenas SELECT permitido
- Parâmetros sempre via prepared statement

## Padrões de Código

### Nomenclatura
```typescript
// Arquivos: kebab-case
// relatorio-form.tsx

// Componentes: PascalCase
// export function RelatorioForm() {}

// Funções: camelCase
// async function criarRelatorio() {}

// Constantes: UPPER_SNAKE_CASE
// const MAX_ROWS_DISPLAY = 1000
```

### Componentes React
```typescript
// Props tipadas
interface RelatorioCardProps {
  relatorio: Relatorio
  onExecutar: () => void
}

// Componente funcional
export function RelatorioCard({ relatorio, onExecutar }: RelatorioCardProps) {
  return (...)
}
```

### API Routes
```typescript
// src/app/api/relatorios/route.ts
export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const relatorios = await prisma.relatorio.findMany({
    where: { empresaId: session.user.empresaId }
  })

  return Response.json(relatorios)
}
```

### Tratamento de Erros
```typescript
// Sempre retornar erro estruturado
return Response.json(
  { error: 'Mensagem amigável', code: 'CODIGO_ERRO' },
  { status: 400 }
)
```

## Variáveis de Ambiente

```env
# .env.example
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="..." # Para criptografar senhas de conexão
```

## Limites e Defaults

| Config | Valor | Motivo |
|--------|-------|--------|
| Max linhas em tela | 1000 | Performance |
| Max linhas export | 100000 | Memória |
| Timeout query | 30s | UX |
| Max conexões/empresa | 10 | Controle |
| Max relatórios/empresa | 100 | Controle |
