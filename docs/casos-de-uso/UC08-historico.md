# UC08 - Histórico de Execuções

## Resumo

Visualização do histórico de execuções de relatórios para auditoria e análise.

## Ator

- **Admin**: Vê histórico de todos os usuários
- **Técnico**: Vê histórico de todos os usuários
- **Usuário**: Vê apenas seu próprio histórico

## Pré-condições

- Usuário logado

## Fluxo Principal - Admin/Técnico

1. Acessa área de Histórico
2. Vê lista de todas as execuções da empresa
3. Pode filtrar por:
   - Relatório
   - Usuário
   - Período
   - Status (sucesso/erro)
4. Pode clicar em uma execução para ver detalhes
5. Detalhes mostram: filtros usados, tempo, linhas retornadas

## Fluxo Principal - Usuário

1. Acessa "Meu Histórico" ou "Execuções Recentes"
2. Vê lista das suas próprias execuções
3. Pode filtrar por relatório e período
4. Pode re-executar com mesmos filtros

## Fluxo Alternativo - Re-executar

1. Usuário clica em "Re-executar" em uma execução anterior
2. Sistema abre o relatório com filtros pré-preenchidos
3. Usuário pode ajustar filtros ou executar direto

## Dados do Histórico

| Campo | Descrição |
|-------|-----------|
| Data/Hora | Quando foi executado |
| Relatório | Nome do relatório |
| Usuário | Quem executou |
| Filtros | Valores usados nos filtros |
| Status | Sucesso ou Erro |
| Tempo | Duração da execução |
| Linhas | Quantidade de linhas retornadas |
| Exportou | Se fez download do Excel |

## Modelo de Dados

### Execucao

```typescript
{
  id: string
  empresaId: string
  relatorioId: string
  usuarioId: string

  // Filtros usados (JSON)
  filtrosUsados: string  // {"data_inicio": "2024-01-01", "vendedor": "5"}

  // Timing
  iniciadoEm: datetime
  finalizadoEm: datetime | null
  tempoExecucaoMs: number | null

  // Resultado
  sucesso: boolean
  erro: string | null
  quantidadeLinhas: number | null

  // Export
  exportou: boolean
  exportadoEm: datetime | null
}
```

## Interface

### Lista de Histórico (Admin)
```
┌─────────────────────────────────────────────────────────────────┐
│ Histórico de Execuções                                          │
├─────────────────────────────────────────────────────────────────┤
│ Filtros: [Todos relatórios ▼] [Todos usuários ▼] [Últimos 7 dias]│
├─────────────────────────────────────────────────────────────────┤
│ Data/Hora        │ Relatório      │ Usuário │ Status │ Tempo   │
│ 15/01 14:30:22   │ Vendas Diárias │ Maria   │ ✓      │ 1.2s    │
│ 15/01 14:28:15   │ Estoque        │ Pedro   │ ✓      │ 0.8s    │
│ 15/01 14:25:00   │ Vendas Diárias │ Maria   │ ✗ Erro │ 30s     │
│ 15/01 14:20:11   │ Clientes       │ João    │ ✓      │ 2.1s    │
└─────────────────────────────────────────────────────────────────┘
```

### Detalhes da Execução
```
┌─────────────────────────────────────────────────────────────────┐
│ Detalhes da Execução                                          X │
├─────────────────────────────────────────────────────────────────┤
│ Relatório:  Vendas Diárias                                      │
│ Usuário:    Maria Santos                                        │
│ Data/Hora:  15/01/2024 14:30:22                                │
│ Status:     ✓ Sucesso                                           │
│ Tempo:      1.234ms                                             │
│ Linhas:     1.542                                               │
│ Exportou:   Sim (14:31:05)                                      │
│                                                                 │
│ Filtros utilizados:                                             │
│ • Data Início: 01/01/2024                                       │
│ • Data Fim: 15/01/2024                                          │
│ • Vendedor: João Silva                                          │
│                                                                 │
│                              [Re-executar] [Fechar]             │
└─────────────────────────────────────────────────────────────────┘
```

### Histórico do Usuário (simplificado)
```
┌─────────────────────────────────────────────────────────────────┐
│ Minhas Execuções Recentes                                       │
├─────────────────────────────────────────────────────────────────┤
│ Vendas Diárias          │ Hoje 14:30    │ ✓ │ [Re-executar]    │
│ Vendas Diárias          │ Hoje 14:25    │ ✗ │ [Re-executar]    │
│ Estoque Atual           │ Ontem 16:45   │ ✓ │ [Re-executar]    │
└─────────────────────────────────────────────────────────────────┘
```

## Retenção de Dados

| Plano | Retenção |
|-------|----------|
| Básico | 30 dias |
| Pro | 90 dias |
| Enterprise | 365 dias |

Job de limpeza roda diariamente removendo execuções antigas.

## Métricas Úteis (Dashboard Admin)

- Relatórios mais executados
- Usuários mais ativos
- Taxa de erro por relatório
- Tempo médio de execução
- Horários de pico

## Critérios de Aceite

- [ ] Admin vê histórico de todos os usuários
- [ ] Usuário vê apenas seu histórico
- [ ] Filtros de busca funcionam
- [ ] Detalhes mostram filtros usados
- [ ] Re-executar preenche filtros corretamente
- [ ] Execuções com erro mostram mensagem
- [ ] Performance OK com muitos registros (paginação)
