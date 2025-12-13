# UC06 - Permissões de Relatório

## Resumo

Administrador define quais usuários podem acessar cada relatório e com qual nível de permissão.

## Ator

Administrador

## Pré-condições

- Relatório já criado
- Usuários cadastrados na empresa

## Fluxo Principal

1. Admin acessa relatório > aba "Permissões"
2. Vê lista de usuários com permissão atual
3. Clica em "Adicionar Usuário"
4. Seleciona usuário
5. Define nível:
   - **Visualizar**: pode executar e ver em tela
   - **Exportar**: pode também baixar Excel
6. Salva
7. Usuário passa a ver o relatório

## Fluxo Alternativo - Remover Permissão

1. Admin clica em "Remover" no usuário
2. Confirma ação
3. Usuário não vê mais o relatório

## Níveis de Permissão

| Nível | Pode Ver | Pode Exportar |
|-------|----------|---------------|
| VISUALIZAR | ✓ | ✗ |
| EXPORTAR | ✓ | ✓ |

## Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| RN01 | Admin e Técnico sempre veem todos os relatórios |
| RN02 | Usuário só vê relatórios com permissão explícita |
| RN03 | Permissão é por usuário (não por role) |
| RN04 | Relatório sem permissões não aparece para ninguém (exceto Admin/Técnico) |

## Modelo de Dados

### Permissao

```typescript
{
  id: string
  relatorioId: string
  usuarioId: string
  nivel: 'VISUALIZAR' | 'EXPORTAR'
  criadoEm: datetime
  criadoPorId: string
}
```

## Query de Relatórios por Usuário

```sql
-- Relatórios que o usuário pode ver
SELECT r.* FROM relatorios r
WHERE r.empresa_id = :empresaId
  AND r.ativo = true
  AND (
    -- Admin/Técnico vê tudo
    :userRole IN ('ADMIN', 'TECNICO')
    OR
    -- Usuário vê se tem permissão
    EXISTS (
      SELECT 1 FROM permissoes p
      WHERE p.relatorio_id = r.id
        AND p.usuario_id = :userId
    )
  )
```

## Interface

### Aba Permissões do Relatório
```
┌─────────────────────────────────────────────────────────┐
│ Relatório: Vendas Diárias                              │
│ [Dados] [Filtros] [Permissões]                         │
├─────────────────────────────────────────────────────────┤
│                                   [+ Adicionar Usuário] │
│                                                         │
│ Usuário         │ Nível      │ Ações                   │
│ Maria Santos    │ Exportar   │ [Editar] [Remover]      │
│ Pedro Lima      │ Visualizar │ [Editar] [Remover]      │
│                                                         │
│ ℹ️ Admin e Técnico sempre têm acesso total              │
└─────────────────────────────────────────────────────────┘
```

### Modal Adicionar Permissão
```
┌─────────────────────────────────────┐
│ Adicionar Permissão               X │
├─────────────────────────────────────┤
│ Usuário: [Pedro Lima ▼]            │
│                                     │
│ Nível:                              │
│ ○ Visualizar (apenas ver em tela)  │
│ ● Exportar (ver e baixar Excel)    │
│                                     │
│          [Cancelar] [Adicionar]    │
└─────────────────────────────────────┘
```

## Futuro: Permissão por Pasta

Na fase de organização, poderá ter permissão por pasta:
- Usuário com permissão na pasta vê todos os relatórios dentro
- Herança automática para subpastas

## Critérios de Aceite

- [ ] Adicionar permissão Visualizar funciona
- [ ] Adicionar permissão Exportar funciona
- [ ] Usuário sem permissão não vê relatório
- [ ] Usuário com Visualizar não consegue exportar
- [ ] Usuário com Exportar consegue exportar
- [ ] Admin/Técnico vê todos os relatórios
- [ ] Remover permissão funciona
