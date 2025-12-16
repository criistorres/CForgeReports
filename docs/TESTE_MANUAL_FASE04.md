# Guia de Teste Manual - FASE 4: Filtros Dinâmicos

## 📋 Pré-requisitos

1. Backend e frontend rodando:
   ```bash
   make start
   ```

2. Usuário logado no sistema (admin@demo.com / admin123)

3. Pelo menos uma conexão de banco configurada

4. Pelo menos um relatório criado

---

## 🧪 Teste 1: Criar Filtros em um Relatório

### Objetivo
Verificar se é possível adicionar diferentes tipos de filtros a um relatório.

### Passos

1. **Acessar a lista de relatórios**
   - URL: `http://localhost:5173/relatorios`
   - Clique no card "📊 Relatórios" no dashboard OU acesse a URL diretamente

2. **Editar um relatório existente**
   - Clique no botão "Editar" de qualquer relatório
   - Você será direcionado para `/relatorios/{id}/editar`

3. **Acessar aba de Filtros**
   - Clique na aba "Filtros" (ao lado de "Dados do Relatório")
   - Você deve ver: "Nenhum filtro configurado. Clique em 'Adicionar Filtro' para começar."

4. **Adicionar Filtro tipo TEXTO**
   - Clique em "+ Adicionar Filtro"
   - Preencha:
     - **Parâmetro**: `@nome_cliente`
     - **Label**: `Nome do Cliente`
     - **Tipo**: `Texto`
     - **Obrigatório**: `☑ Marcado`
     - **Valor Padrão**: (deixar vazio)

5. **Adicionar Filtro tipo DATA**
   - Clique novamente em "+ Adicionar Filtro"
   - Preencha:
     - **Parâmetro**: `@data_inicio`
     - **Label**: `Data Início`
     - **Tipo**: `Data`
     - **Obrigatório**: `☐ Desmarcado`
     - **Valor Padrão**: `2024-01-01`

6. **Adicionar Filtro tipo NUMERO**
   - Clique novamente em "+ Adicionar Filtro"
   - Preencha:
     - **Parâmetro**: `@valor_minimo`
     - **Label**: `Valor Mínimo`
     - **Tipo**: `Número`
     - **Obrigatório**: `☐ Desmarcado`
     - **Valor Padrão**: (deixar vazio)

7. **Adicionar Filtro tipo LISTA**
   - Clique novamente em "+ Adicionar Filtro"
   - Preencha:
     - **Parâmetro**: `@status`
     - **Label**: `Status`
     - **Tipo**: `Lista`
     - **Obrigatório**: `☑ Marcado`
   - Clique em "Editar" ao lado de "Opções"
   - No modal, digite (uma opção por linha):
     ```
     Ativo
     Inativo
     Pendente
     ```
   - Clique em "Salvar"

8. **Testar reordenação**
   - Use os botões ↑ e ↓ para mudar a ordem dos filtros
   - Verifique que os botões ficam desabilitados no primeiro e último filtro

9. **Salvar filtros**
   - Clique em "Salvar Filtros"
   - Deve aparecer um alert: "Filtros salvos com sucesso!"
   - Clique em OK

### ✅ Resultado Esperado
- Todos os 4 filtros devem ser salvos
- A ordem deve ser mantida
- As configurações (obrigatório, tipo, opções) devem ser preservadas

---

## 🧪 Teste 2: Atualizar Query SQL com Parâmetros

### Objetivo
Verificar se a query pode usar os parâmetros criados.

### Passos

1. **Voltar para aba "Dados do Relatório"**
   - Clique na aba "Dados do Relatório"

2. **Atualizar a query SQL**
   - No campo "Query SQL", modifique para usar os parâmetros:
   ```sql
   SELECT *
   FROM clientes
   WHERE nome LIKE '%' + @nome_cliente + '%'
     AND data_cadastro >= @data_inicio
     AND valor_total >= @valor_minimo
     AND status = @status
   ```

   **Nota**: Ajuste a query para a sintaxe do seu banco:
   - SQL Server: use `+` para concatenação
   - PostgreSQL/MySQL: use `||` ou `CONCAT()`

3. **Salvar o relatório**
   - Clique em "Salvar"
   - Você deve ser redirecionado para `/relatorios`

### ✅ Resultado Esperado
- Query salva com sucesso
- Parâmetros reconhecidos pelo sistema

---

## 🧪 Teste 3: Executar Relatório com Filtros Obrigatórios

### Objetivo
Validar que filtros obrigatórios são exigidos antes da execução.

### Passos

1. **Acessar execução do relatório**
   - Na lista de relatórios, clique em "Executar"
   - URL: `/relatorios/{id}/executar`

2. **Verificar formulário de filtros**
   - Deve aparecer uma seção "Filtros"
   - Todos os 4 filtros devem estar visíveis:
     - `Nome do Cliente` (campo texto com asterisco vermelho)
     - `Data Início` (campo data SEM asterisco, com texto "Padrão: 2024-01-01")
     - `Valor Mínimo` (campo número SEM asterisco)
     - `Status` (select com asterisco vermelho)

3. **Tentar executar sem preencher obrigatórios**
   - Deixe `Nome do Cliente` vazio
   - Deixe `Status` vazio
   - Clique em "Executar Relatório"
   - **Esperado**: Navegador deve bloquear (HTML5 validation)

4. **Preencher apenas filtros obrigatórios**
   - `Nome do Cliente`: `Silva`
   - `Status`: Selecione `Ativo`
   - Deixe os outros vazios
   - Clique em "Executar Relatório"

### ✅ Resultado Esperado
- Relatório executa com sucesso
- Dados são filtrados corretamente
- Tempo de execução é exibido
- Tabela com resultados aparece

---

## 🧪 Teste 4: Executar com Todos os Filtros Preenchidos

### Objetivo
Validar substituição de todos os parâmetros na query.

### Passos

1. **Preencher todos os filtros**
   - `Nome do Cliente`: `Silva`
   - `Data Início`: `2024-06-01`
   - `Valor Mínimo`: `1000`
   - `Status`: `Ativo`

2. **Executar relatório**
   - Clique em "Executar Relatório"

3. **Verificar resultado**
   - Deve mostrar apenas registros que atendem TODOS os critérios:
     - Nome contém "Silva"
     - Data >= 2024-06-01
     - Valor >= 1000
     - Status = Ativo

### ✅ Resultado Esperado
- Query executada com todos os parâmetros substituídos
- Resultados filtrados corretamente
- Nenhum erro de SQL

---

## 🧪 Teste 5: Validação de Erro com Filtro Obrigatório Vazio

### Objetivo
Verificar que o backend valida filtros obrigatórios.

### Passos

1. **Usar Developer Tools**
   - Abra DevTools do navegador (F12)
   - Vá para aba "Network"

2. **Desabilitar validação HTML5 temporariamente**
   - No DevTools Console, digite:
   ```javascript
   document.querySelector('form').noValidate = true
   ```

3. **Limpar filtro obrigatório**
   - Limpe o campo `Nome do Cliente`
   - Mantenha `Status` preenchido

4. **Tentar executar**
   - Clique em "Executar Relatório"
   - Observe a requisição na aba Network

### ✅ Resultado Esperado
- Backend retorna erro 400 (ou 200 com `sucesso: false`)
- Mensagem: `Filtro "Nome do Cliente" é obrigatório`
- Erro é exibido na tela em vermelho

---

## 🧪 Teste 6: Editar Filtros Existentes

### Objetivo
Verificar que filtros podem ser editados após criação.

### Passos

1. **Voltar para edição do relatório**
   - Clique em "← Voltar" e depois em "Editar"
   - Ou acesse `/relatorios/{id}/editar` diretamente

2. **Acessar aba Filtros**
   - Clique na aba "Filtros"
   - Todos os 4 filtros criados devem aparecer

3. **Modificar um filtro**
   - No filtro `@nome_cliente`:
     - Mude o Label para `Nome Completo do Cliente`
     - Desmarque "Obrigatório"

4. **Remover um filtro**
   - No filtro `@valor_minimo`:
     - Clique no botão "✕" (vermelho)
   - O filtro deve desaparecer

5. **Salvar alterações**
   - Clique em "Salvar Filtros"
   - Alert de sucesso deve aparecer

6. **Verificar persistência**
   - Recarregue a página (F5)
   - Volte para aba "Filtros"
   - Verificar:
     - `@nome_cliente` agora é "Nome Completo do Cliente" e não-obrigatório
     - `@valor_minimo` não aparece mais
     - Outros 2 filtros permanecem inalterados

### ✅ Resultado Esperado
- Alterações salvas corretamente
- Filtros removidos desaparecem
- Labels e configurações atualizadas

---

## 🧪 Teste 7: Relatório sem Filtros

### Objetivo
Garantir compatibilidade com relatórios que não têm filtros.

### Passos

1. **Criar novo relatório sem filtros**
   - Vá para `/relatorios/novo`
   - Preencha:
     - Nome: `Relatório Simples`
     - Conexão: (escolha qualquer)
     - Query: `SELECT TOP 10 * FROM tabela`
   - Clique em "Salvar"

2. **Executar relatório**
   - Clique em "Executar"

### ✅ Resultado Esperado
- Seção "Filtros" NÃO aparece
- Botão "Executar Relatório" aparece diretamente
- Relatório executa normalmente ao clicar

---

## 🧪 Teste 8: Exportar para Excel com Filtros

### Objetivo
Verificar que exportação funciona com filtros aplicados.

### Passos

1. **Executar relatório com filtros**
   - Use o relatório criado anteriormente
   - Preencha os filtros
   - Clique em "Executar Relatório"

2. **Exportar resultado**
   - Após ver os resultados, clique em "Exportar Excel"
   - Arquivo deve ser baixado

3. **Abrir arquivo Excel**
   - Abra o arquivo `.xlsx` baixado
   - Verifique se os dados correspondem ao filtro aplicado

### ✅ Resultado Esperado
- Excel contém apenas dados filtrados
- Colunas e valores corretos
- Nome do arquivo: `{nome-relatorio}_{timestamp}.xlsx`

---

## 🧪 Teste 9: Validação de Tipos de Dados

### Objetivo
Testar validação de formatos de dados.

### Passos

1. **Criar filtro tipo NUMERO**
   - Crie filtro `@idade` tipo Número

2. **Tentar inserir texto em campo numérico**
   - Na execução, tente digitar "abc" no campo
   - **Esperado**: Campo não aceita (HTML5 input type="number")

3. **Criar filtro tipo DATA**
   - Crie filtro `@nascimento` tipo Data

4. **Validar formato de data**
   - Navegador deve forçar formato YYYY-MM-DD
   - Date picker deve abrir ao clicar

### ✅ Resultado Esperado
- Validação de tipos funciona no frontend
- Formatos corretos são enviados ao backend

---

## 🛑 Como Parar os Servidores

```bash
make stop
```

ou

```bash
make kill
```

---

## 📊 Checklist de Validação

Marque cada item conforme completa os testes:

- [ ] Teste 1: Criar filtros (TEXTO, DATA, NUMERO, LISTA) ✅
- [ ] Teste 2: Atualizar query com parâmetros ✅
- [ ] Teste 3: Validar filtros obrigatórios ✅
- [ ] Teste 4: Executar com todos filtros preenchidos ✅
- [ ] Teste 5: Erro backend para filtro obrigatório vazio ✅
- [ ] Teste 6: Editar filtros existentes ✅
- [ ] Teste 7: Relatório sem filtros funciona ✅
- [ ] Teste 8: Exportar Excel com filtros ✅
- [ ] Teste 9: Validação de tipos de dados ✅

---

## 🐛 Problemas Conhecidos

Nenhum problema conhecido até o momento.

---

## 💡 Dicas

1. **Limpar cache do navegador**: Se algo não atualizar, pressione `Ctrl+Shift+R` (ou `Cmd+Shift+R` no Mac)

2. **Ver logs do backend**:
   ```bash
   # Em outro terminal
   cd backend
   source venv/bin/activate
   python manage.py runserver
   # Logs aparecem aqui
   ```

3. **Ver console do frontend**: Abra DevTools (F12) e vá para aba "Console"

4. **Resetar banco de dados** (se precisar):
   ```bash
   cd backend
   source venv/bin/activate
   rm db.sqlite3
   python manage.py migrate
   python manage.py loaddata initial_data.json
   ```

---

## 📞 Suporte

Se encontrar algum problema durante os testes:

1. Verifique os logs do backend
2. Verifique o console do navegador (F12)
3. Tente `make restart` para reiniciar as aplicações
4. Reporte o erro com print screen e logs
