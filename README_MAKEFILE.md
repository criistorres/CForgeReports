# 🚀 Guia de Uso do Makefile

Este projeto inclui um Makefile para facilitar o gerenciamento das aplicações backend e frontend.

## 📋 Comandos Disponíveis

### Ver todos os comandos
```bash
make help
```

---

## 🎯 Comandos Principais

### Iniciar Aplicações
```bash
make start
# ou
make dev
```
**O que faz:**
- Inicia o backend Django na porta 8000
- Inicia o frontend Vite na porta 5173
- Ambos rodam em paralelo

**URLs:**
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

---

### Parar Aplicações
```bash
make stop
# ou
make kill
```
**O que faz:**
- Para todos os processos do Django e Vite
- Limpa processos pendentes

---

### Reiniciar Aplicações
```bash
make restart
```
**O que faz:**
- Para as aplicações
- Inicia novamente
- Útil após mudanças de configuração

---

## 🔧 Comandos de Desenvolvimento

### Iniciar Apenas Backend
```bash
make backend
```
Inicia apenas o servidor Django (útil para debug ou desenvolvimento de API)

---

### Iniciar Apenas Frontend
```bash
make frontend
```
Inicia apenas o Vite (útil para desenvolvimento de UI)

---

### Aplicar Migrations
```bash
make migrate
```
Aplica todas as migrations pendentes do Django

---

### Criar Novas Migrations
```bash
make makemigrations
```
Cria migrations baseadas nas mudanças dos models

---

### Shell Django
```bash
make shell-backend
```
Abre o shell interativo do Django para testes

---

### Criar Superusuário
```bash
make createsuperuser
```
Cria um novo superusuário para acessar /admin/

---

## 🧪 Comandos de Teste

### Testar Backend
```bash
make test-backend
```
Roda os testes do Django

---

### Testar Frontend
```bash
make test-frontend
```
Roda os testes do frontend (npm test)

---

## 🛠️ Comandos de Manutenção

### Setup Inicial
```bash
make setup
```
**O que faz:**
- Cria virtualenv do Python
- Instala dependências do backend
- Instala dependências do frontend
- Aplica migrations
- **Use apenas na primeira vez!**

---

### Limpar Cache
```bash
make clean
```
**O que faz:**
- Remove arquivos `__pycache__`
- Remove arquivos `.pyc`
- Remove cache do Vite
- Limpa arquivos temporários

---

### Build de Produção
```bash
make build-frontend
```
Cria build otimizado do frontend para produção

---

### Verificar Status
```bash
make check
```
Verifica se backend e frontend estão rodando

---

### Mostrar URLs
```bash
make urls
```
Exibe as URLs das aplicações

---

## 📝 Exemplos de Uso

### Primeiro uso (instalação)
```bash
# 1. Clone o repositório
git clone <repo-url>
cd CForgeReports

# 2. Rode o setup
make setup

# 3. Inicie as aplicações
make start
```

---

### Desenvolvimento diário
```bash
# Iniciar
make start

# Trabalhar normalmente...

# Parar ao fim do dia
make stop
```

---

### Após fazer mudanças nos models
```bash
# 1. Criar migrations
make makemigrations

# 2. Aplicar migrations
make migrate

# 3. Reiniciar backend
make restart
```

---

### Debug de problemas
```bash
# 1. Parar tudo
make stop

# 2. Limpar cache
make clean

# 3. Reiniciar
make start

# 4. Verificar status
make check
```

---

## ⚠️ Notas Importantes

1. **Primeira execução**: Execute `make setup` apenas uma vez

2. **Porta em uso**: Se as portas 8000 ou 5173 já estiverem em uso:
   ```bash
   # Parar processos antigos
   make stop

   # Ou matar manualmente
   lsof -ti:8000 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   ```

3. **Virtualenv**: O Makefile ativa automaticamente o virtualenv do Python

4. **Logs**: Para ver logs em tempo real:
   ```bash
   # Backend
   cd backend && source venv/bin/activate && python manage.py runserver

   # Frontend
   cd frontend && npm run dev
   ```

5. **Múltiplos terminais**: Se preferir, rode backend e frontend em terminais separados:
   ```bash
   # Terminal 1
   make backend

   # Terminal 2
   make frontend
   ```

---

## 🐛 Troubleshooting

### Comando não encontrado
```bash
# Certifique-se que make está instalado
which make

# macOS: brew install make
# Linux: sudo apt install make
```

### Permissão negada
```bash
# Dê permissão de execução
chmod +x Makefile
```

### Backend não inicia
```bash
# Verifique o Python
python3 --version

# Verifique o virtualenv
cd backend
source venv/bin/activate
python --version
```

### Frontend não inicia
```bash
# Verifique o Node
node --version
npm --version

# Reinstale dependências
cd frontend
rm -rf node_modules
npm install
```

---

## 📚 Recursos Adicionais

- [Documentação Django](https://docs.djangoproject.com/)
- [Documentação Vite](https://vitejs.dev/)
- [Guia de Testes Manuais](docs/TESTE_MANUAL_FASE04.md)

---

## 🎯 Comandos Mais Usados (Resumo)

```bash
make start      # Iniciar tudo
make stop       # Parar tudo
make restart    # Reiniciar tudo
make check      # Verificar status
make clean      # Limpar cache
make help       # Ver todos comandos
```
