# Fase 00 - Preparação

## Objetivo

Estruturar o projeto Next.js com todas as dependências e configurações base.

## Contexto

- Projeto começa do zero
- MVP Django existe mas não será usado como base
- Protótipo UI existe para referência de design

## Dependências

Nenhuma (primeira fase)

## Entregas

### 1. Criar projeto Next.js

```bash
npx create-next-app@latest forge-reports --typescript --tailwind --eslint --app --src-dir
```

### 2. Instalar dependências

```bash
# ORM e banco
npm install prisma @prisma/client

# Autenticação
npm install next-auth

# Conexões externas
npm install mssql pg mysql2

# Utilitários
npm install bcryptjs
npm install zod  # validação
npm install xlsx  # export excel

# Dev
npm install -D @types/bcryptjs @types/mssql
```

### 3. Configurar Prisma

```bash
npx prisma init
```

Criar schema inicial com modelo Empresa e Usuario.

### 4. Configurar variáveis de ambiente

```env
# .env.example
DATABASE_URL="postgresql://user:pass@localhost:5432/forgereports"
NEXTAUTH_SECRET="gerar-secret-seguro"
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="gerar-chave-32-bytes"
```

### 5. Estrutura de pastas

```
forge-reports/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── ui/
│   │       └── button.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   └── auth.ts
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma
├── .env.example
├── .env.local
└── package.json
```

### 6. Schema Prisma inicial

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Empresa {
  id            String    @id @default(cuid())
  nome          String
  slug          String    @unique
  ativo         Boolean   @default(true)
  maxUsuarios   Int       @default(10)
  maxConexoes   Int       @default(5)
  maxRelatorios Int       @default(50)
  criadoEm      DateTime  @default(now())
  atualizadoEm  DateTime  @updatedAt

  usuarios      Usuario[]
}

model Usuario {
  id           String    @id @default(cuid())
  empresaId    String
  nome         String
  email        String
  senhaHash    String?
  role         Role      @default(USUARIO)
  ativo        Boolean   @default(true)
  ativadoEm    DateTime?
  criadoEm     DateTime  @default(now())
  atualizadoEm DateTime  @updatedAt

  empresa      Empresa   @relation(fields: [empresaId], references: [id])

  @@unique([empresaId, email])
}

enum Role {
  ADMIN
  TECNICO
  USUARIO
}
```

### 7. Configurar Tailwind

Garantir que Tailwind está configurado com:
- Dark mode (class strategy)
- Cores customizadas (purple, slate do protótipo)

### 8. Componente UI base

Criar pelo menos:
- Button
- Input
- Card

Pode usar shadcn/ui:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card
```

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `forge-reports/` | Novo diretório do projeto |
| `prisma/schema.prisma` | Schema do banco |
| `.env.example` | Template de variáveis |
| `src/lib/db.ts` | Cliente Prisma |
| `src/app/layout.tsx` | Layout raiz |
| `src/app/page.tsx` | Página inicial (redirect para login) |

## Critérios de Conclusão

- [ ] `npm run dev` inicia sem erros
- [ ] `npx prisma db push` cria tabelas no banco
- [ ] Página inicial carrega
- [ ] Tailwind funcionando (testar classe bg-purple-500)
- [ ] Variáveis de ambiente configuradas
- [ ] Git inicializado com .gitignore adequado

## Comandos de Verificação

```bash
# Iniciar dev server
npm run dev

# Verificar banco
npx prisma studio

# Verificar tipos
npm run type-check  # ou npx tsc --noEmit
```

## Notas

- Não implementar lógica de negócio nesta fase
- Foco em estrutura e configuração
- Próxima fase (01) implementará autenticação
