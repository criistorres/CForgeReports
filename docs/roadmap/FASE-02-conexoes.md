# Fase 02 - Conexões de Banco

## Objetivo

Permitir cadastro e teste de conexões SQL Server.

## Contexto

- Auth funcionando (Fase 1 completa)
- Usuário logado tem empresaId na sessão
- Apenas Admin e Técnico podem gerenciar conexões

## Dependências

- Fase 1 completa

## Casos de Uso Relacionados

- [UC03 - Conexões de Banco](../casos-de-uso/UC03-conexoes-banco.md)

## Entregas

### 1. Modelo Prisma

```prisma
// Adicionar ao schema.prisma
model Conexao {
  id              String    @id @default(cuid())
  empresaId       String
  nome            String
  tipo            TipoBanco
  host            String
  porta           Int
  database        String
  usuario         String
  senhaEncriptada String
  ativo           Boolean   @default(true)
  criadoEm        DateTime  @default(now())
  atualizadoEm    DateTime  @updatedAt
  ultimoTesteEm   DateTime?
  ultimoTesteOk   Boolean?

  empresa         Empresa   @relation(fields: [empresaId], references: [id])
  relatorios      Relatorio[]

  @@unique([empresaId, nome])
}

enum TipoBanco {
  SQLSERVER
  POSTGRESQL
  MYSQL
}
```

### 2. Utilitário de Criptografia

```typescript
// src/lib/crypto.ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':')

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)

  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
```

### 3. Serviço de Conexão

```typescript
// src/lib/connections/index.ts
import sql from 'mssql'
import { decrypt } from '../crypto'
import { prisma } from '../db'

export async function testarConexao(
  tipo: string,
  host: string,
  porta: number,
  database: string,
  usuario: string,
  senha: string
): Promise<{ sucesso: boolean; erro?: string }> {
  if (tipo === 'SQLSERVER') {
    return testarSqlServer(host, porta, database, usuario, senha)
  }

  return { sucesso: false, erro: 'Tipo de banco não suportado' }
}

async function testarSqlServer(
  host: string,
  porta: number,
  database: string,
  usuario: string,
  senha: string
): Promise<{ sucesso: boolean; erro?: string }> {
  const config: sql.config = {
    server: host,
    port: porta,
    database,
    user: usuario,
    password: senha,
    options: {
      encrypt: false,
      trustServerCertificate: true
    },
    connectionTimeout: 10000
  }

  try {
    const pool = await sql.connect(config)
    await pool.close()
    return { sucesso: true }
  } catch (error: any) {
    return { sucesso: false, erro: error.message }
  }
}

export async function executarQuery(
  conexaoId: string,
  query: string,
  params?: Record<string, any>
): Promise<{ dados: any[]; erro?: string }> {
  const conexao = await prisma.conexao.findUnique({
    where: { id: conexaoId }
  })

  if (!conexao) {
    return { dados: [], erro: 'Conexão não encontrada' }
  }

  const senha = decrypt(conexao.senhaEncriptada)

  // Implementar execução por tipo de banco
  // ...
}
```

### 4. API de Conexões

```typescript
// src/app/api/conexoes/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { encrypt } from '@/lib/crypto'
import { z } from 'zod'

const conexaoSchema = z.object({
  nome: z.string().min(1),
  tipo: z.enum(['SQLSERVER', 'POSTGRESQL', 'MYSQL']),
  host: z.string().min(1),
  porta: z.number().int().positive(),
  database: z.string().min(1),
  usuario: z.string().min(1),
  senha: z.string().min(1)
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const conexoes = await prisma.conexao.findMany({
    where: { empresaId: session.user.empresaId },
    select: {
      id: true,
      nome: true,
      tipo: true,
      host: true,
      porta: true,
      database: true,
      usuario: true,
      ativo: true,
      ultimoTesteEm: true,
      ultimoTesteOk: true
      // NÃO retorna senhaEncriptada
    }
  })

  return Response.json(conexoes)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'TECNICO'].includes(session.user.role)) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const validacao = conexaoSchema.safeParse(body)

  if (!validacao.success) {
    return Response.json({ error: validacao.error }, { status: 400 })
  }

  const { nome, tipo, host, porta, database, usuario, senha } = validacao.data

  const conexao = await prisma.conexao.create({
    data: {
      empresaId: session.user.empresaId,
      nome,
      tipo,
      host,
      porta,
      database,
      usuario,
      senhaEncriptada: encrypt(senha)
    }
  })

  return Response.json({ id: conexao.id })
}
```

### 5. API de Teste de Conexão

```typescript
// src/app/api/conexoes/testar/route.ts
import { testarConexao } from '@/lib/connections'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'TECNICO'].includes(session.user.role)) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { tipo, host, porta, database, usuario, senha } = await request.json()

  const resultado = await testarConexao(tipo, host, porta, database, usuario, senha)

  return Response.json(resultado)
}
```

### 6. Interface de Conexões

Criar telas:
- Lista de conexões
- Modal/página de nova conexão
- Botão de testar
- Feedback visual do teste

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `prisma/schema.prisma` | Modificar (add Conexao) |
| `src/lib/crypto.ts` | Criar |
| `src/lib/connections/index.ts` | Criar |
| `src/lib/connections/sqlserver.ts` | Criar |
| `src/app/api/conexoes/route.ts` | Criar |
| `src/app/api/conexoes/[id]/route.ts` | Criar |
| `src/app/api/conexoes/testar/route.ts` | Criar |
| `src/app/(dashboard)/conexoes/page.tsx` | Criar |
| `src/components/features/conexao-form.tsx` | Criar |

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
# 3. Criar nova conexão (usar SQL Server local ou de teste)
# 4. Testar conexão
# 5. Verificar no banco que senha está criptografada
# 6. Logar como outro usuário de outra empresa
# 7. Verificar que não vê a conexão
```

## Notas

- Fase 2 implementa apenas SQL Server
- PostgreSQL e MySQL ficam para Fase 8
- Timeout de teste é 10 segundos
- Considerar pool de conexões (fase futura, performance)
