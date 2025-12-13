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

## Stack do Projeto

| Camada | Tecnologia |
|--------|------------|
| **Backend** | Django + Django REST Framework |
| **Auth** | JWT (SimpleJWT) |
| **Banco Sistema** | PostgreSQL |
| **Dados** | pandas, pyodbc, psycopg2 |
| **Frontend** | React + Vite + TypeScript |
| **Estilo** | Tailwind CSS |

## Estrutura de Pastas

```
CForgeReports/
├── backend/           # Django API
│   ├── config/        # Settings, URLs
│   ├── apps/          # Django apps (empresas, usuarios, conexoes, relatorios)
│   ├── core/          # Utils compartilhados
│   └── services/      # Lógica de negócio
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── contexts/
├── docs/              # Esta documentação
├── forgereports/      # MVP (referência)
└── forge-reports-standalone/  # Protótipo UI (referência)
```

## Estrutura dos Arquivos de Fase

Cada arquivo de fase (`roadmap/FASE-XX-*.md`) contém:

```markdown
# Fase XX - Nome

## Objetivo
(1 frase do que essa fase entrega)

## Contexto
(o que já existe antes dessa fase)

## Entregas
(código de exemplo para implementar)

## Critérios de Conclusão
(como saber que terminou)

## Arquivos a Criar/Modificar
(lista específica de arquivos)
```

## Estrutura dos Casos de Uso

Cada arquivo de caso de uso (`casos-de-uso/UC0X-*.md`) contém:

```markdown
# UC0X - Nome

## Resumo
(1-2 frases)

## Ator
(quem executa)

## Fluxo Principal
(passos numerados)

## Regras de Negócio
(validações, restrições)
```

## Convenções do Projeto

### Backend (Python)
```python
# Arquivos: snake_case
# query_executor.py

# Classes: PascalCase
# class QueryExecutor:

# Funções: snake_case
# def execute_query():
```

### Frontend (TypeScript)
```typescript
// Arquivos: kebab-case ou PascalCase para componentes
// ConexaoForm.tsx

// Componentes: PascalCase
// function ConexaoForm() {}

// Funções: camelCase
// async function fetchConexoes() {}
```

### Commits
```
tipo: descrição curta

Tipos: feat, fix, docs, refactor, test
Exemplo: feat: implementa login de usuário
```

## Contexto do Código Existente

### MVP Django (`forgereports/`)
- **Funcional** - usar como referência!
- Código de conexão SQL Server funciona
- Export Excel funciona
- Ver: `forgereports/reports/views.py`

### Protótipo UI (`forge-reports-standalone/`)
- Apenas visual, não funciona
- Usar como referência de design
- Ver: `forge-reports-standalone/index.html`

### Schema do Banco
- Diagrama em: `forgereports_schema.html`
- Usar como referência para modelagem

## Regras de Desenvolvimento

1. **Aproveitar o MVP** - Código de conexão/query já existe
2. **Não over-engineer** - Implementar apenas o que a fase pede
3. **Isolamento** - Toda query filtra por `empresa_id`
4. **Segurança** - Queries são SELECT only, senhas criptografadas
5. **Commits pequenos** - Um commit por entrega lógica

## Padrões de API

### Views (Django REST Framework)
```python
class ConexaoViewSet(EmpresaQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = ConexaoSerializer
    permission_classes = [IsAuthenticated, IsTecnicoOrAdmin]

    def get_queryset(self):
        return Conexao.objects.filter(empresa_id=self.request.user.empresa_id)
```

### Respostas de Erro
```python
return Response(
    {'error': 'Mensagem amigável', 'code': 'CODIGO_ERRO'},
    status=status.HTTP_400_BAD_REQUEST
)
```

### Frontend - Chamadas API
```typescript
try {
  const response = await api.get('/conexoes/')
  setConexoes(response.data)
} catch (err) {
  setError('Erro ao carregar conexões')
}
```

## Variáveis de Ambiente

### Backend
```env
DEBUG=True
SECRET_KEY=chave-secreta
DB_NAME=forgereports
DB_USER=postgres
DB_PASSWORD=senha
ENCRYPTION_KEY=chave-para-criptografia
```

### Frontend
```env
VITE_API_URL=http://localhost:8000/api
```
