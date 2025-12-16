# Fase 05 - Estilo e UI

## Objetivo

Implementar sistema de design consistente usando shadcn/ui com tema customizado inspirado no standalone, priorizando performance.

## Contexto

- Filtros funcionando (Fase 4 completa)
- Frontend funcional mas sem estilo consistente
- Referência visual: `forge-reports-standalone/css/style.css`

## Dependências

- Fase 4 completa (filtros)

## Decisões de Design

### Por que shadcn/ui?

| Critério | Benefício |
|----------|-----------|
| Performance | Não é dependência runtime - código copiado para o projeto |
| Bundle size | Só inclui componentes usados |
| Customização | 100% editável (é seu código) |
| Acessibilidade | Componentes com ARIA correto |
| Consistência | Base sólida de comportamentos |

### Estratégia de Estilo

```
shadcn/ui (estrutura + comportamento)
    +
Tema Tailwind customizado (cores ForgeReports)
    +
CSS otimizado (sem animações contínuas)
```

## Paleta de Cores

Baseada no standalone, otimizada para dark theme:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Backgrounds
        forge: {
          bg: '#0f172a',
          card: 'rgba(15, 23, 42, 0.7)',
          hover: 'rgba(15, 23, 42, 0.9)',
        },
        // Primary - Roxo
        primary: {
          DEFAULT: '#a855f7',
          50: 'rgba(168, 85, 247, 0.05)',
          100: 'rgba(168, 85, 247, 0.1)',
          200: 'rgba(168, 85, 247, 0.2)',
          300: 'rgba(168, 85, 247, 0.3)',
          400: '#8b5cf6',
          500: '#a855f7',
          600: '#9333ea',
        },
        // Accent - Verde
        accent: {
          DEFAULT: '#06d6a0',
          50: 'rgba(6, 214, 160, 0.05)',
          100: 'rgba(6, 214, 160, 0.1)',
          200: 'rgba(6, 214, 160, 0.2)',
          500: '#06d6a0',
          600: '#10b981',
        },
        // Status
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'forge': '12px',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-green': '0 0 20px rgba(6, 214, 160, 0.3)',
        'card': '0 20px 40px rgba(0, 0, 0, 0.3)',
      },
    },
  },
}
```

## Componentes shadcn Necessários

Instalar via CLI do shadcn:

```bash
# Inicializar shadcn
npx shadcn@latest init

# Componentes essenciais
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add badge
npx shadcn@latest add toast
npx shadcn@latest add tabs
npx shadcn@latest add form
npx shadcn@latest add skeleton
```

## Estrutura de Arquivos

```
frontend/src/
├── components/
│   └── ui/                    # Componentes shadcn
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ...
├── styles/
│   ├── globals.css           # Reset + variáveis CSS
│   └── forge-theme.css       # Estilos customizados
└── lib/
    └── utils.ts              # cn() helper
```

## Arquivo globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Fontes */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* CSS Variables para shadcn */
@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 270 91% 65%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 160 84% 39%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 270 91% 65%;
    --radius: 0.75rem;
  }
}

@layer base {
  body {
    @apply bg-forge-bg text-foreground font-sans;
  }
}
```

## Arquivo forge-theme.css

Estilos customizados inspirados no standalone, **otimizados para performance**:

```css
/* Glass Card - SEM backdrop-filter contínuo */
.glass-card {
  @apply bg-forge-card border border-primary-200 rounded-forge;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.glass-card:hover {
  @apply border-primary-300;
  box-shadow: 0 20px 40px rgba(168, 85, 247, 0.15);
}

/* Gradient Border - Estático */
.gradient-border {
  position: relative;
  background: linear-gradient(var(--forge-bg), var(--forge-bg)) padding-box,
              linear-gradient(135deg, #a855f7, #06d6a0) border-box;
  border: 2px solid transparent;
  border-radius: 12px;
}

/* Gradient Text */
.gradient-text {
  background: linear-gradient(135deg, #a855f7 0%, #06d6a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glow apenas em interação (não contínuo) */
.glow-on-hover:hover {
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
}

.glow-on-focus:focus {
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
}

/* Status Dot - Animação apenas quando necessário */
.status-dot {
  @apply w-2 h-2 rounded-full;
}

.status-dot.active {
  @apply bg-success;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.status-dot.inactive {
  @apply bg-muted-foreground;
}

/* Loading - Única animação permitida */
.loading-bar {
  height: 2px;
  background: linear-gradient(90deg, #a855f7, #06d6a0, #a855f7);
  background-size: 200% 100%;
  animation: loading 1.5s ease infinite;
}

@keyframes loading {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}

/* Scrollbar customizada */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #a855f7, #06d6a0);
  border-radius: 4px;
}

/* Terminal/Code blocks */
.code-block {
  @apply bg-black/90 border border-primary-500 rounded-forge p-4 font-mono text-sm;
  color: #10b981;
}
```

## Componentes Customizados

### ForgeCard

```tsx
// components/forge/ForgeCard.tsx
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ForgeCardProps {
  title?: string
  children: React.ReactNode
  className?: string
  glowOnHover?: boolean
}

export function ForgeCard({ title, children, className, glowOnHover = true }: ForgeCardProps) {
  return (
    <Card className={cn(
      'glass-card',
      glowOnHover && 'glow-on-hover',
      className
    )}>
      {title && (
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
```

### ForgeButton

```tsx
// components/forge/ForgeButton.tsx
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '@/components/ui/button'

interface ForgeButtonProps extends ButtonProps {
  glow?: boolean
}

export function ForgeButton({ className, glow = false, ...props }: ForgeButtonProps) {
  return (
    <Button
      className={cn(
        'bg-gradient-to-r from-primary-500 to-primary-400',
        'hover:from-primary-400 hover:to-primary-600',
        'transition-all duration-200',
        glow && 'glow-on-hover',
        className
      )}
      {...props}
    />
  )
}
```

### ForgeInput

```tsx
// components/forge/ForgeInput.tsx
import { cn } from '@/lib/utils'
import { Input, InputProps } from '@/components/ui/input'
import { forwardRef } from 'react'

export const ForgeInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          'bg-white/5 border-white/10',
          'focus:border-primary-300 glow-on-focus',
          'placeholder:text-muted-foreground',
          className
        )}
        {...props}
      />
    )
  }
)

ForgeInput.displayName = 'ForgeInput'
```

### ForgeBadge

```tsx
// components/forge/ForgeBadge.tsx
import { cn } from '@/lib/utils'
import { Badge, BadgeProps } from '@/components/ui/badge'

type ForgeVariant = 'active' | 'inactive' | 'pending' | 'error'

interface ForgeBadgeProps extends Omit<BadgeProps, 'variant'> {
  variant?: ForgeVariant
}

const variantStyles: Record<ForgeVariant, string> = {
  active: 'bg-success/20 text-success border-success/30',
  inactive: 'bg-muted/20 text-muted-foreground border-muted/30',
  pending: 'bg-warning/20 text-warning border-warning/30',
  error: 'bg-error/20 text-error border-error/30',
}

export function ForgeBadge({ variant = 'active', className, ...props }: ForgeBadgeProps) {
  return (
    <Badge
      className={cn(
        'border uppercase text-xs font-semibold',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
```

## Regras de Performance

### FAZER:
- Usar `transition` para efeitos de hover (GPU-friendly)
- Glow effects apenas em `:hover` e `:focus`
- Gradientes estáticos
- Animações apenas para loading/feedback

### NÃO FAZER:
- ❌ Animações de gradiente contínuas (`animation: liquidFlow 15s infinite`)
- ❌ `backdrop-filter: blur()` em muitos elementos
- ❌ Múltiplos `box-shadow` no mesmo elemento
- ❌ Animações de pulse contínuas

### Uso de backdrop-filter

Permitido **apenas** em:
- Modais (`dialog`)
- Dropdowns
- Tooltips

```css
/* Apenas modais usam blur */
.modal-overlay {
  @apply bg-black/80;
  backdrop-filter: blur(4px);
}
```

## Layout Base

```tsx
// components/layout/AppLayout.tsx
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function AppLayout({ children, sidebar }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-forge-bg">
      {/* Header */}
      <header className="h-16 border-b border-primary-200 glass-card">
        <div className="h-full flex items-center justify-between px-6">
          <h1 className="text-xl font-bold gradient-text">ForgeReports</h1>
          {/* User menu aqui */}
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <aside className="w-64 min-h-[calc(100vh-4rem)] border-r border-primary-200 p-4">
            {sidebar}
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

## Entregáveis

### Backend
- Nenhum (fase apenas frontend)

### Frontend
1. [ ] shadcn/ui inicializado e configurado
2. [ ] `tailwind.config.js` com tema ForgeReports
3. [ ] `globals.css` com variáveis CSS
4. [ ] `forge-theme.css` com estilos customizados
5. [ ] Componentes Forge: Card, Button, Input, Badge
6. [ ] Layout base (AppLayout)
7. [ ] Refatorar telas existentes para usar novos componentes:
   - Login
   - Lista de conexões
   - Lista de relatórios
   - Execução de relatório com filtros

## Critérios de Aceite

- [ ] Estilo visual consistente com paleta roxa/verde
- [ ] Dark theme em todas as telas
- [ ] Sem animações contínuas (exceto loading)
- [ ] Lighthouse Performance > 90
- [ ] Componentes shadcn funcionando
- [ ] Telas existentes refatoradas com novo estilo

## Referência Visual

Consultar: `forge-reports-standalone/css/style.css`

Elementos a manter:
- Paleta de cores (roxo `#a855f7`, verde `#06d6a0`)
- Dark background (`#0f172a`)
- Border radius arredondado (12px)
- Gradient text no logo
- Glow effects em hover

Elementos a simplificar:
- Gradientes animados → estáticos
- Blur em todos os cards → apenas modais
- Pulse animations → remover
