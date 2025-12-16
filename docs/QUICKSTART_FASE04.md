# ⚡ QuickStart - Teste FASE 4 (5 minutos)

## 🚀 Iniciar Aplicações

```bash
cd /Users/cristiantorres/Documents/GitHub/CForgeReports
make start
```

Aguarde até ver:
- ✅ Backend: "Starting development server at http://127.0.0.1:8000/"
- ✅ Frontend: "Local: http://localhost:5173/"

---

## 🧪 Teste Rápido (Passo a Passo)

### 1️⃣ Fazer Login
1. Abra: http://localhost:5173
2. Login: `admin@demo.com`
3. Senha: `admin123`

---

### 2️⃣ Criar Filtros

1. Clique em **"📊 Relatórios"**
2. Clique em **"Editar"** no relatório "Teste"
3. Clique na aba **"Filtros"**
4. Clique em **"+ Adicionar Filtro"**
5. Preencha:
   - Parâmetro: `@codigo`
   - Label: `Código do Produto`
   - Tipo: `Texto`
   - ☑️ Marque **"Obrigatório"**
6. Clique em **"Salvar Filtros"**
7. Clique **OK** no alert

---

### 3️⃣ Atualizar Query

1. Clique na aba **"Dados do Relatório"**
2. No campo "Query SQL", adicione o filtro:
   ```sql
   SELECT TOP 10 B1_COD, B1_DESC
   FROM P11FLY.dbo.SB1180
   WHERE B1_COD = @codigo
   ```
3. Clique em **"Salvar"**

---

### 4️⃣ Executar com Filtro

1. Na lista de relatórios, clique em **"Executar"**
2. Você verá o campo **"Código do Produto *"** (asterisco = obrigatório)
3. Digite: `0000000001`
4. Clique em **"Executar Relatório"**
5. ✅ Resultado aparece na tela!

---

### 5️⃣ Validar Obrigatório (Opcional)

1. Limpe o campo
2. Tente executar
3. ❌ Navegador bloqueia (campo obrigatório vazio)

---

## 🎉 Pronto!

Você testou:
- ✅ Criar filtro
- ✅ Salvar filtro
- ✅ Atualizar query com parâmetro
- ✅ Executar relatório com filtro
- ✅ Validação de campo obrigatório

---

## 🛑 Parar Aplicações

```bash
make stop
```

---

## 📊 Teste Completo

Para testes mais detalhados, veja: [TESTE_MANUAL_FASE04.md](TESTE_MANUAL_FASE04.md)

---

## 🆘 Problemas?

```bash
# Reiniciar tudo
make restart

# Verificar status
make check

# Ver ajuda
make help
```
