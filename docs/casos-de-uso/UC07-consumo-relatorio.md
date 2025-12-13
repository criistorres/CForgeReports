# UC07 - Consumo de Relatório

## Resumo

Usuário final executa relatório: preenche filtros, visualiza resultado, exporta Excel.

## Ator

Usuário (também Admin e Técnico)

## Pré-condições

- Usuário logado
- Tem permissão no relatório (ou é Admin/Técnico)

## Fluxo Principal

1. Usuário acessa dashboard ou lista de relatórios
2. Vê apenas relatórios com permissão
3. Clica no relatório desejado
4. Preenche filtros obrigatórios
5. (Opcional) Preenche filtros opcionais
6. Clica em "Executar"
7. Aguarda carregamento
8. Visualiza resultado em tabela
9. (Opcional) Clica em "Exportar Excel"
10. Download inicia automaticamente

## Fluxo Alternativo - Erro na Execução

1. Query falha (timeout, erro SQL, conexão)
2. Sistema mostra mensagem de erro amigável
3. Usuário pode tentar novamente

## Fluxo Alternativo - Muitas Linhas

1. Resultado tem mais linhas que o limite de tela
2. Sistema mostra primeiras N linhas
3. Mensagem: "Mostrando 1.000 de 15.432 linhas. Exporte para ver todas."

## Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| RN01 | Filtros obrigatórios devem ser preenchidos |
| RN02 | Timeout de 30 segundos na execução |
| RN03 | Máximo de linhas em tela configurável (default 1000) |
| RN04 | Excel pode ter todas as linhas (limite: 100.000) |
| RN05 | Registrar execução no histórico |
| RN06 | Usuário com permissão Visualizar não vê botão Exportar |

## Modelo de Dados

### Execucao (log)

```typescript
{
  id: string
  relatorioId: string
  usuarioId: string
  filtrosUsados: string  // JSON dos valores
  iniciadoEm: datetime
  finalizadoEm: datetime | null
  sucesso: boolean
  erro: string | null
  quantidadeLinhas: number | null
  tempoExecucaoMs: number | null
  exportou: boolean
}
```

## Interface

### Dashboard do Usuário
```
┌─────────────────────────────────────────────────────────┐
│ Olá, Maria!                                            │
├─────────────────────────────────────────────────────────┤
│ ⭐ Favoritos                                            │
│ ┌─────────────┐ ┌─────────────┐                        │
│ │ Vendas      │ │ Estoque     │                        │
│ │ Diárias     │ │ Atual       │                        │
│ └─────────────┘ └─────────────┘                        │
│                                                         │
│ 📋 Todos os Relatórios                                  │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ Vendas      │ │ Estoque     │ │ Clientes    │        │
│ │ Diárias     │ │ Atual       │ │ Novos       │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Tela de Execução
```
┌─────────────────────────────────────────────────────────┐
│ ← Voltar                              Vendas por Período│
├─────────────────────────────────────────────────────────┤
│ Filtros:                                                │
│ Data Início*: [15/01/2024] Data Fim*: [15/01/2024]     │
│ Vendedor:     [Todos ▼]                                │
│                                        [Executar]       │
├─────────────────────────────────────────────────────────┤
│ Resultado (1.000 de 5.432 linhas)      [Exportar Excel] │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Data       │ Vendedor     │ Cliente    │ Valor     ││
│ │ 15/01/2024 │ João Silva   │ Acme Corp  │ 1.500,00  ││
│ │ 15/01/2024 │ João Silva   │ Beta Ltda  │ 2.300,00  ││
│ │ 15/01/2024 │ Maria Santos │ Gama SA    │ 890,00    ││
│ │ ...        │ ...          │ ...        │ ...       ││
│ └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Tabela de Resultado

Funcionalidades:
- Ordenação por coluna (client-side)
- Scroll horizontal se muitas colunas
- Formatação automática (datas, números)
- Células grandes mostram tooltip

## Excel Export

Nome do arquivo: `{nome-relatorio}_{timestamp}.xlsx`

Exemplo: `vendas-por-periodo_2024-01-15_143022.xlsx`

Conteúdo:
- Aba única com todos os dados
- Cabeçalho em negrito
- Colunas auto-dimensionadas
- Datas formatadas
- Números formatados

## Performance

| Item | Limite | Ação |
|------|--------|------|
| Linhas em tela | 1.000 | Paginar ou truncar |
| Linhas no Excel | 100.000 | Erro se exceder |
| Tempo execução | 30s | Timeout |
| Colunas | 50 | Limite por sanidade |

## Critérios de Aceite

- [ ] Usuário vê apenas relatórios com permissão
- [ ] Filtros obrigatórios são validados
- [ ] Execução retorna dados corretos
- [ ] Tabela exibe resultado formatado
- [ ] Limite de linhas em tela funciona
- [ ] Exportar Excel funciona
- [ ] Permissão Visualizar esconde botão Exportar
- [ ] Execução é registrada no histórico
- [ ] Erro mostra mensagem amigável
