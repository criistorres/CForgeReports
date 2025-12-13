# Roadmap de Desenvolvimento

## Visão Geral

O desenvolvimento está dividido em fases incrementais. Cada fase entrega valor e pode ser testada independentemente.

## Fases

| Fase | Nome | Objetivo | Casos de Uso |
|------|------|----------|--------------|
| 00 | [Preparação](./FASE-00-preparacao.md) | Setup do projeto | - |
| 01 | [Auth e Multi-tenant](./FASE-01-auth-multitenant.md) | Login e isolamento | UC01, UC02 |
| 02 | [Conexões](./FASE-02-conexoes.md) | Cadastro de bancos | UC03 |
| 03 | [Relatórios Básicos](./FASE-03-relatorios-basicos.md) | Criar e executar | UC04, UC07 |
| 04 | [Filtros](./FASE-04-filtros.md) | Parâmetros dinâmicos | UC05 |
| 05 | [Permissões](./FASE-05-permissoes.md) | Controle de acesso | UC06 |
| 06 | [Organização e UX](./FASE-06-organizacao-ux.md) | Pastas, favoritos | UC08 |

## Marcos de Entrega

```
MARCO 1 - MVP (Fases 0-3)
├── Sistema funcionando end-to-end
├── Técnico cria → Usuário executa → Exporta Excel
└── Validação: 1 cliente piloto

MARCO 2 - Produto Básico (Fases 4-6)
├── Filtros dinâmicos
├── Permissões granulares
├── Interface organizada
└── Validação: 3+ clientes pagantes

MARCO 3 - Enterprise (Fases futuras)
├── Múltiplos bancos (PostgreSQL, MySQL)
├── Agendamento
├── Filtros avançados
└── Dashboards
```

## Diagrama de Dependências

```
Fase 0 (Setup)
    │
    ▼
Fase 1 (Auth) ────────────────┐
    │                         │
    ▼                         │
Fase 2 (Conexões)             │
    │                         │
    ▼                         │
Fase 3 (Relatórios) ◄─────────┘
    │
    ├─────────────┐
    ▼             ▼
Fase 4        Fase 5
(Filtros)    (Permissões)
    │             │
    └──────┬──────┘
           ▼
       Fase 6
    (Organização)
```

## Como Usar Este Roadmap

### Para Desenvolvimento

1. Leia a fase atual que vai implementar
2. Cada fase lista:
   - O que precisa estar pronto (dependências)
   - O que implementar (entregas)
   - Arquivos a criar/modificar
   - Como saber que terminou (critérios)

### Para IA Desenvolvedora

```
1. Identifique a fase da tarefa
2. Leia APENAS o arquivo da fase
3. Consulte caso de uso se precisar de detalhes de negócio
4. Implemente
5. Verifique critérios de conclusão
```

## Status Atual

| Fase | Status |
|------|--------|
| 00 | Não iniciada |
| 01 | Não iniciada |
| 02 | Não iniciada |
| 03 | Não iniciada |
| 04 | Não iniciada |
| 05 | Não iniciada |
| 06 | Não iniciada |

## Próximos Passos

1. **Iniciar Fase 0** - Setup do projeto Next.js
2. **Revisar** - Stack técnica definida em `DECISOES_TECNICAS.md`
