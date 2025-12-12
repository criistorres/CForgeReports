# Fase 01 - Autenticação e Multi-tenancy

## Objetivo

Implementar login de usuários com isolamento por empresa (multi-tenant).

## Contexto

- Projeto estruturado (Fase 0 completa)
- Schema Prisma com Empresa e Usuario existe
- NextAuth instalado

## Dependências

- Fase 0 completa

## Casos de Uso Relacionados

- [UC01 - Cadastro de Empresa](../casos-de-uso/UC01-cadastro-empresa.md)
- [UC02 - Gestão de Usuários](../casos-de-uso/UC02-gestao-usuarios.md)

## Entregas

### 1. Configurar NextAuth

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const usuario = await prisma.usuario.findFirst({
          where: {
            email: credentials.email,
            ativo: true,
            senhaHash: { not: null }
          },
          include: { empresa: true }
        })

        if (!usuario || !usuario.senhaHash) {
          return null
        }

        const senhaValida = await bcrypt.compare(
          credentials.password,
          usuario.senhaHash
        )

        if (!senhaValida) {
          return null
        }

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nome,
          empresaId: usuario.empresaId,
          role: usuario.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.empresaId = user.empresaId
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub
      session.user.empresaId = token.empresaId
      session.user.role = token.role
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
}
```

### 2. Tipos do NextAuth

```typescript
// src/types/next-auth.d.ts
import { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      empresaId: string
      role: Role
    }
  }

  interface User {
    empresaId: string
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    empresaId: string
    role: Role
  }
}
```

### 3. Página de Login

```typescript
// src/app/(auth)/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const result = await signIn('credentials', {
      email,
      password: senha,
      redirect: false
    })

    if (result?.error) {
      setErro('Email ou senha inválidos')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Implementar UI */}
    </form>
  )
}
```

### 4. Middleware de Proteção

```typescript
// src/middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login'
  }
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/relatorios/:path*',
    '/conexoes/:path*',
    '/usuarios/:path*'
  ]
}
```

### 5. Script de Seed (primeira empresa e admin)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const senhaHash = await bcrypt.hash('admin123', 10)

  const empresa = await prisma.empresa.create({
    data: {
      nome: 'Empresa Demo',
      slug: 'demo',
      usuarios: {
        create: {
          nome: 'Administrador',
          email: 'admin@demo.com',
          senhaHash,
          role: 'ADMIN',
          ativadoEm: new Date()
        }
      }
    }
  })

  console.log('Empresa criada:', empresa)
}

main()
```

### 6. API de Gestão de Usuários

```typescript
// src/app/api/usuarios/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Sempre filtrar por empresa!
  const usuarios = await prisma.usuario.findMany({
    where: { empresaId: session.user.empresaId },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      ativo: true,
      ativadoEm: true
    }
  })

  return Response.json(usuarios)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()

  // Validar e criar usuário
  // ...
}
```

### 7. Tela de Listagem de Usuários

Implementar interface para Admin ver e gerenciar usuários da empresa.

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/lib/auth.ts` | Criar |
| `src/types/next-auth.d.ts` | Criar |
| `src/app/api/auth/[...nextauth]/route.ts` | Criar |
| `src/app/(auth)/login/page.tsx` | Criar |
| `src/app/(dashboard)/layout.tsx` | Criar |
| `src/app/(dashboard)/dashboard/page.tsx` | Criar |
| `src/app/(dashboard)/usuarios/page.tsx` | Criar |
| `src/app/api/usuarios/route.ts` | Criar |
| `src/middleware.ts` | Criar |
| `prisma/seed.ts` | Criar |

## Critérios de Conclusão

- [ ] Login funciona com email/senha
- [ ] Sessão contém empresaId e role
- [ ] Rotas protegidas redirecionam para login
- [ ] Seed cria empresa e admin de teste
- [ ] API de usuários filtra por empresa
- [ ] Admin consegue ver lista de usuários
- [ ] Logout funciona

## Testes Manuais

```bash
# 1. Rodar seed
npx prisma db seed

# 2. Acessar /login
# 3. Logar com admin@demo.com / admin123
# 4. Verificar redirecionamento para /dashboard
# 5. Acessar /usuarios
# 6. Verificar que só vê usuários da empresa
```

## Notas

- Senha temporária do seed deve ser trocada em produção
- Considerar rate limiting no login (fase futura)
- Considerar 2FA (fase futura)
