# UC05 - Definição de Filtros

## Resumo

Técnico define filtros (parâmetros) para um relatório. Usuário preencherá esses filtros antes de executar.

## Ator

Administrador ou Técnico

## Pré-condições

- Relatório já criado
- Query usa placeholders (ex: `@data_inicio`, `:vendedor_id`)

## Fluxo Principal

1. Usuário acessa relatório > aba "Filtros"
2. Clica em "Adicionar Filtro"
3. Preenche:
   - Parâmetro (nome na query, ex: `@data_inicio`)
   - Label (exibido para usuário, ex: "Data Início")
   - Tipo (Data, Texto, Número, Lista)
   - Obrigatório (sim/não)
   - Valor padrão (opcional)
4. Para tipo Lista: define opções
5. Ordena filtros (drag and drop)
6. Salva

## Tipos de Filtro

| Tipo | Input | Exemplo de Uso |
|------|-------|----------------|
| DATA | Datepicker | Período de vendas |
| TEXTO | Text input | Nome do cliente |
| NUMERO | Number input | Valor mínimo |
| LISTA | Select/Dropdown | Status, Vendedor |

## Lista: Fixa vs Dinâmica

### Lista Fixa
Opções definidas manualmente:
```
["Ativo", "Inativo", "Pendente"]
```

### Lista Dinâmica (Fase 9)
Opções vêm de uma query:
```sql
SELECT id, nome FROM vendedores WHERE ativo = 1
```

## Modelo de Dados

### Filtro

```typescript
{
  id: string
  relatorioId: string
  parametro: string      // @data_inicio
  label: string          // "Data Início"
  tipo: 'DATA' | 'TEXTO' | 'NUMERO' | 'LISTA'
  obrigatorio: boolean
  valorPadrao: string | null
  ordem: number

  // Para tipo LISTA
  opcoes: string | null  // JSON: ["op1", "op2"] ou null se dinâmica
  queryOpcoes: string | null  // Query para lista dinâmica (fase futura)
}
```

## Placeholder na Query

A query deve usar placeholders que serão substituídos:

```sql
-- SQL Server
SELECT * FROM vendas
WHERE data >= @data_inicio
  AND data <= @data_fim
  AND (@vendedor IS NULL OR vendedor_id = @vendedor)

-- PostgreSQL
SELECT * FROM vendas
WHERE data >= $1
  AND data <= $2
  AND ($3 IS NULL OR vendedor_id = $3)
```

## Interface

### Aba Filtros do Relatório
```
┌─────────────────────────────────────────────────────────┐
│ Relatório: Vendas por Período                          │
│ [Dados] [Filtros] [Permissões]                         │
├─────────────────────────────────────────────────────────┤
│                                      [+ Adicionar Filtro]│
│                                                         │
│ ☰ @data_inicio │ Data Início │ Data    │ Obrigatório  │
│ ☰ @data_fim    │ Data Fim    │ Data    │ Obrigatório  │
│ ☰ @vendedor    │ Vendedor    │ Lista   │ Opcional     │
│                                                         │
│ (arraste ☰ para reordenar)                             │
└─────────────────────────────────────────────────────────┘
```

### Modal Adicionar Filtro
```
┌─────────────────────────────────────┐
│ Adicionar Filtro                  X │
├─────────────────────────────────────┤
│ Parâmetro:   [@data_inicio_____]   │
│ Label:       [Data Início______]   │
│ Tipo:        [Data ▼]              │
│ Obrigatório: [✓]                   │
│ Valor Padrão:[__________________]  │
│                                     │
│ (Para Lista)                        │
│ Opções: [Ativo, Inativo, Pendente] │
│                                     │
│          [Cancelar] [Adicionar]    │
└─────────────────────────────────────┘
```

## Validação

| Validação | Descrição |
|-----------|-----------|
| Parâmetro existe na query | Avisar se @param não está na query |
| Parâmetro único | Não pode ter 2 filtros com mesmo parâmetro |
| Lista tem opções | Tipo Lista deve ter pelo menos 1 opção |

## Critérios de Aceite

- [ ] Adicionar filtro tipo Data funciona
- [ ] Adicionar filtro tipo Texto funciona
- [ ] Adicionar filtro tipo Número funciona
- [ ] Adicionar filtro tipo Lista funciona
- [ ] Reordenar filtros funciona
- [ ] Excluir filtro funciona
- [ ] Validação de parâmetro na query funciona
