# Guia para IA Desenvolvedora

## Como Usar Esta Documentação

Esta documentação foi estruturada para facilitar o desenvolvimento por IA com context window limitada.

### Regra Principal

> **Leia apenas o que precisa para a tarefa atual.**

Não carregue todos os documentos. Cada arquivo é auto-contido.

### Fluxo de Trabalho

```
1. Recebe tarefa (ex: "implementar login")
2. Identifica a fase do roadmap (ex: FASE-01)
3. Lê APENAS:
   - docs/roadmap/FASE-01-auth-multitenant.md
   - docs/casos-de-uso/UC02-gestao-usuarios.md (se precisar detalhes)
   - docs/DECISOES_TECNICAS.md (se tiver dúvida de padrão)
4. Implementa
5. Não precisa ler outros arquivos
```

### Mapa de Documentos

| Se a tarefa é sobre... | Leia... |
|------------------------|---------|
| Entender o produto | `VISAO_PRODUTO.md` |
| Stack/padrões de código | `DECISOES_TECNICAS.md` |
| Detalhes de uma feature | `casos-de-uso/UC0X-*.md` |
| O que implementar agora | `roadmap/FASE-XX-*.md` |

## Estrutura dos Arquivos de Fase

Cada arquivo de fase (`roadmap/FASE-XX-*.md`) contém:

```markdown
# Fase XX - Nome

## Objetivo
(1 frase do que essa fase entrega)

## Contexto
(o que já existe antes dessa fase)

## Entregas
(lista do que implementar)

## Critérios de Conclusão
(como saber que terminou)

## Arquivos a Criar/Modificar
(lista específica de arquivos)

## Dependências
(o que precisa estar pronto antes)
```

## Estrutura dos Casos de Uso

Cada arquivo de caso de uso (`casos-de-uso/UC0X-*.md`) contém:

```markdown
# UC0X - Nome

## Resumo
(1-2 frases)

## Ator
(quem executa)

## Pré-condições
(o que precisa existir antes)

## Fluxo Principal
(passos numerados)

## Regras de Negócio
(validações, restrições)

## Modelo de Dados
(campos relevantes)
```

## Convenções do Projeto

### Nomenclatura de Arquivos
- Casos de uso: `UC01-nome-kebab-case.md`
- Fases: `FASE-01-nome-kebab-case.md`
- Código: seguir padrão da linguagem

### Commits
```
tipo: descrição curta

Tipos: feat, fix, docs, refactor, test
Exemplo: feat: implementa login de usuário
```

### Branches
```
feature/fase-XX-nome
fix/descricao-curta
```

## Contexto do Código Existente

### MVP Django (`forgereports/`)
- Funcional mas não usar como base
- Serve como referência de como conectar em SQL Server
- Código em: `forgereports/reports/views.py`

### Protótipo UI (`forge-reports-standalone/`)
- Apenas visual, não funciona
- Usar como referência de design
- Ver: `forge-reports-standalone/index.html`

### Schema do Banco
- Diagrama em: `forgereports_schema.html`
- Usar como referência para modelagem

## Regras de Desenvolvimento

1. **Não over-engineer** - Implementar apenas o que a fase pede
2. **Testes** - Cada feature deve ter teste básico
3. **Isolamento** - Toda query filtra por `empresa_id`
4. **Segurança** - Queries são SELECT only, senhas criptografadas
5. **Commits pequenos** - Um commit por entrega lógica
