# ForgeReports - Documentação

## Estrutura

```
docs/
├── README.md                 # Este arquivo (índice)
├── VISAO_PRODUTO.md         # O que é, para quem, modelo de negócio
├── CONTEXTO_IA.md           # Guia para IA desenvolvedora
├── DECISOES_TECNICAS.md     # Stack, arquitetura, padrões
├── casos-de-uso/
│   ├── README.md            # Lista e resumo dos casos de uso
│   ├── UC01-cadastro-empresa.md
│   ├── UC02-gestao-usuarios.md
│   ├── UC03-conexoes-banco.md
│   ├── UC04-criacao-relatorio.md
│   ├── UC05-filtros.md
│   ├── UC06-permissoes.md
│   ├── UC07-consumo-relatorio.md
│   └── UC08-historico.md
└── roadmap/
    ├── README.md            # Visão geral das fases
    ├── FASE-00-preparacao.md
    ├── FASE-01-auth-multitenant.md
    ├── FASE-02-conexoes.md
    ├── FASE-03-relatorios-basicos.md
    ├── FASE-04-filtros.md
    ├── FASE-05-permissoes.md
    └── FASE-06-organizacao-ux.md
```

## Como Usar Esta Documentação

### Para Humanos
1. Comece por `VISAO_PRODUTO.md` para entender o produto
2. Veja `casos-de-uso/README.md` para lista completa de funcionalidades
3. Consulte `roadmap/README.md` para ordem de desenvolvimento

### Para IA Desenvolvedora
1. Leia `CONTEXTO_IA.md` primeiro (instruções de como usar os docs)
2. Para cada tarefa, leia apenas a fase específica do roadmap
3. Consulte o caso de uso relacionado para detalhes de negócio
4. Siga `DECISOES_TECNICAS.md` para padrões de código

## Links Rápidos

| Documento | Quando Usar |
|-----------|-------------|
| [Visão do Produto](./VISAO_PRODUTO.md) | Entender o que estamos construindo |
| [Contexto IA](./CONTEXTO_IA.md) | Antes de iniciar qualquer desenvolvimento |
| [Decisões Técnicas](./DECISOES_TECNICAS.md) | Dúvidas sobre stack/padrões |
| [Casos de Uso](./casos-de-uso/README.md) | Detalhes de uma funcionalidade |
| [Roadmap](./roadmap/README.md) | O que desenvolver e em que ordem |

## Status do Projeto

- **MVP Atual**: `forgereports/` - Django backend funcional para SQL Server
- **Protótipo UI**: `forge-reports-standalone/` - HTML/CSS/JS mockup
- **Próximo Passo**: Fase 0 - Preparação do projeto novo
