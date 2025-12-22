# Roadmap de Automação de Relatórios

Este documento descreve as etapas necessárias para tornar funcional o módulo de Agendamentos, transformando o cadastro atual em um sistema de execução automática.

## 🏁 Estado Atual

- ✅ **Configurações SMTP**: O sistema já armazena credenciais de email.
- ✅ **CRUD de Agendamentos**: É possível criar, editar e listar regras de agendamento.
- ❌ **Motor de Execução**: O botão "Executar Agora" é apenas visual (mock).
- ❌ **Agendador (Scheduler)**: O sistema não verifica horários automaticamente.

---

## 📅 Próximos Passos

### Fase 3: Execução Manual (Email sob demanda)
Antes de automatizar, precisamos garantir que o sistema consiga gerar e enviar UM relatório.

1. **Serviço de Envio de Email**:
   - Criar `core/services/email_service.py`.
   - Implementar função que usa as configurações SMTP da empresa (não as do `settings.py` global) para enviar email.

2. **Serviço de Execução de Relatório**:
   - Criar `apps/execucoes/services.py`.
   - Implementar lógica que gera o arquivo (PDF/Excel) em memória buffer (sem salvar em disco necessariamente).

3. **Ligar o Botão "Executar Agora"**:
   - Atualizar a view `executar_agora` em `apps/agendamentos/views.py`.
   - Fluxo:
     1. Recebe ID do agendamento.
     2. Roda a query do relatório.
     3. Gera o arquivo.
     4. Envia email para os destinatários cadastrados.
     5. Registra log em `ExecucaoAgendada`.

---

### Fase 4: Infraestrutura de Automação (Celery)
Para que o sistema trabalhe sozinho ("enquanto você dorme").

1. **Instalar Dependências**:
   - `pip install celery redis django-celery-beat`
   - Configurar servidor Redis (Docker ou local).

2. **Configurar Celery no Django**:
   - Criar `backend/config/celery.py`.
   - Definir settings do Celery em `settings.py`.

3. **Criar Tasks Assíncronas**:
   - Converter a lógica da "Fase 3" em uma `@shared_task`.
   - Permite que o botão "Executar Agora" não trave a interface (o usuário clica e pode sair, o processamento ocorre no worker).

---

### Fase 5: O Relógio (Celery Beat)
Para verificar a hora e disparar os agendamentos.

1. **Task de Verificação (Heartbeat)**:
   - Criar task `verificar_agendamentos_pendentes()`.
   - Roda a cada 60 segundos.
   - Lógica:
     - "Quais agendamentos estão ATIVOS?"
     - "Quais agendamentos têm `hora_execucao` <= AGORA e ainda não rodaram hoje?"
     - Para cada um encontrado -> Dispara a task de execução.
     - Atualiza `proxima_execucao`.

---

## 🛠 Comandos Úteis (Futuro)

Para rodar a infraestrutura completa, precisaremos de 3 terminais:

1. **Django API**: `python manage.py runserver`
2. **Celery Worker**: `celery -A config worker -l info` (Executa o trabalho pesado)
3. **Celery Beat**: `celery -A config beat -l info` (O relógio que dispara tarefas)
