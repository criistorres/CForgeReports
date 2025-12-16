.PHONY: help setup start stop restart backend frontend logs clean test

# Cores para output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m # No Color

help: ## Mostra esta mensagem de ajuda
	@echo "$(GREEN)ForgeReports - Comandos Disponíveis$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

setup: ## Instala dependências do backend e frontend
	@echo "$(GREEN)Instalando dependências do backend...$(NC)"
	cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
	@echo "$(GREEN)Instalando dependências do frontend...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)Aplicando migrations...$(NC)"
	cd backend && source venv/bin/activate && python manage.py migrate
	@echo "$(GREEN)Setup completo!$(NC)"

start: ## Inicia backend e frontend
	@echo "$(GREEN)Iniciando aplicações...$(NC)"
	@make -j2 backend frontend

backend: ## Inicia apenas o backend (Django)
	@echo "$(GREEN)Iniciando backend na porta 8000...$(NC)"
	@cd backend && source venv/bin/activate && python manage.py runserver

frontend: ## Inicia apenas o frontend (Vite)
	@echo "$(GREEN)Iniciando frontend na porta 5173...$(NC)"
	@cd frontend && npm run dev

stop: ## Para backend e frontend
	@echo "$(YELLOW)Parando aplicações...$(NC)"
	@pkill -f "python manage.py runserver" || true
	@pkill -f "vite" || true
	@echo "$(GREEN)Aplicações paradas!$(NC)"

restart: stop start ## Reinicia backend e frontend

logs-backend: ## Mostra logs do backend
	@tail -f backend/logs/*.log 2>/dev/null || echo "$(YELLOW)Nenhum log encontrado$(NC)"

clean: ## Remove arquivos temporários e cache
	@echo "$(YELLOW)Limpando arquivos temporários...$(NC)"
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type d -name "node_modules" -prune -o -type d -name ".vite" -exec rm -rf {} + 2>/dev/null || true
	@echo "$(GREEN)Limpeza concluída!$(NC)"

migrate: ## Aplica migrations do Django
	@echo "$(GREEN)Aplicando migrations...$(NC)"
	@cd backend && source venv/bin/activate && python manage.py migrate

makemigrations: ## Cria novas migrations do Django
	@echo "$(GREEN)Criando migrations...$(NC)"
	@cd backend && source venv/bin/activate && python manage.py makemigrations

shell-backend: ## Abre shell do Django
	@cd backend && source venv/bin/activate && python manage.py shell

createsuperuser: ## Cria superusuário do Django
	@cd backend && source venv/bin/activate && python manage.py createsuperuser

test-backend: ## Roda testes do backend
	@echo "$(GREEN)Rodando testes do backend...$(NC)"
	@cd backend && source venv/bin/activate && python manage.py test

test-frontend: ## Roda testes do frontend
	@echo "$(GREEN)Rodando testes do frontend...$(NC)"
	@cd frontend && npm test

build-frontend: ## Build de produção do frontend
	@echo "$(GREEN)Criando build de produção...$(NC)"
	@cd frontend && npm run build

check: ## Verifica se as aplicações estão rodando
	@echo "$(GREEN)Verificando status...$(NC)"
	@curl -s http://localhost:8000/api/ > /dev/null && echo "$(GREEN)✓ Backend rodando em http://localhost:8000$(NC)" || echo "$(RED)✗ Backend não está rodando$(NC)"
	@curl -s http://localhost:5173 > /dev/null && echo "$(GREEN)✓ Frontend rodando em http://localhost:5173$(NC)" || echo "$(RED)✗ Frontend não está rodando$(NC)"

urls: ## Mostra URLs das aplicações
	@echo ""
	@echo "$(GREEN)URLs das aplicações:$(NC)"
	@echo "  Backend:  $(YELLOW)http://localhost:8000$(NC)"
	@echo "  Frontend: $(YELLOW)http://localhost:5173$(NC)"
	@echo "  Admin:    $(YELLOW)http://localhost:8000/admin/$(NC)"
	@echo ""

# Atalhos úteis
dev: start ## Alias para 'make start'
kill: stop ## Alias para 'make stop'
