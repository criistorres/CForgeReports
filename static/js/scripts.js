// ForgeReports - Scripts JavaScript - Fase 2

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes da página
    initializeComponents();
    
    // Configurar eventos
    setupEventListeners();
    
    // Configurar CSRF token para AJAX
    setupCSRFToken();
});

function initializeComponents() {
    // Carregar estrutura de pastas na sidebar
    loadFolderStructure();
    
    // Configurar tooltips do Bootstrap
    if (typeof $().tooltip === 'function') {
        $('[data-toggle="tooltip"]').tooltip();
    }
    
    // Configurar popovers do Bootstrap  
    if (typeof $().popover === 'function') {
        $('[data-toggle="popover"]').popover();
    }
    
    // Verificar modo de visualização atual
    checkViewMode();
}

function setupEventListeners() {
    // Toggle entre modo técnico e usuário - ATUALIZADO PARA FASE 2
    const toggleViewMode = document.getElementById('toggleViewMode');
    if (toggleViewMode) {
        toggleViewMode.addEventListener('click', function(e) {
            e.preventDefault();
            toggleUserViewMode();
        });
    }
    
    // Auto-submit do formulário de pesquisa após 500ms de inatividade
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.form.submit();
            }, 500);
        });
    }
    
    // Confirmação antes de excluir items
    document.querySelectorAll('.btn-delete').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            if (!confirm('Tem certeza que deseja excluir este item?')) {
                e.preventDefault();
            }
        });
    });
    
    // Validação de formulários em tempo real
    setupFormValidation();
}

function setupCSRFToken() {
    // Configurar token CSRF em requisições AJAX
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    if (csrfToken) {
        // Para jQuery AJAX (se disponível)
        if (typeof $ !== 'undefined') {
            $.ajaxSetup({
                beforeSend: function(xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", csrfToken);
                    }
                }
            });
        }
        
        // Para fetch API
        window.csrfToken = csrfToken;
    }
}

function csrfSafeMethod(method) {
    // HTTP methods que não requerem CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function loadFolderStructure() {
    const foldersContainer = document.getElementById('report-folders');
    if (!foldersContainer) return;
    
    // Mostrar loading
    showLoading(foldersContainer, 'Carregando estrutura de pastas...');
    
    // Simular carregamento das pastas - SERÁ IMPLEMENTADO COM AJAX NA FASE 4
    setTimeout(() => {
        foldersContainer.innerHTML = `
            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link" href="#" data-folder-id="root">
                        <i class="fas fa-folder text-warning"></i> Relatórios Principais
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link pl-4" href="#" data-folder-id="1">
                        <i class="fas fa-folder text-warning"></i> Financeiro
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link pl-5" href="#" data-report-id="1">
                        <i class="fas fa-file-alt text-info"></i> Vendas Mensais
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link pl-4" href="#" data-folder-id="2">
                        <i class="fas fa-folder text-warning"></i> Operacional
                    </a>
                </li>
            </ul>
        `;
        
        // Adicionar eventos de clique nas pastas e relatórios
        setupFolderEvents();
    }, 1000);
}

function setupFolderEvents() {
    // Eventos para expandir/contrair pastas
    document.querySelectorAll('[data-folder-id]').forEach(function(folder) {
        folder.addEventListener('click', function(e) {
            e.preventDefault();
            toggleFolder(this.dataset.folderId);
        });
    });
    
    // Eventos para abrir relatórios
    document.querySelectorAll('[data-report-id]').forEach(function(report) {
        report.addEventListener('click', function(e) {
            e.preventDefault();
            openReport(this.dataset.reportId);
        });
    });
}

function toggleFolder(folderId) {
    console.log('Toggling folder:', folderId);
    // Implementar lógica para expandir/contrair pasta
    // Será implementado com AJAX na Fase 4
}

function openReport(reportId) {
    console.log('Opening report:', reportId);
    // Redirecionar para página do relatório
    // window.location.href = `/reports/${reportId}/`;
}

// FUNCIONALIDADE PRINCIPAL DA FASE 2: Toggle de Modo de Visualização
function toggleUserViewMode() {
    const toggleButton = document.getElementById('toggleViewMode');
    
    if (!toggleButton) {
        console.error('Botão toggleViewMode não encontrado');
        return;
    }
    
    // Obter URL do atributo data-url
    const toggleUrl = toggleButton.getAttribute('data-url');
    if (!toggleUrl) {
        console.error('URL não encontrada no botão toggleViewMode');
        showAlert('Erro: URL de toggle não configurada', 'error');
        return;
    }
    
    // Mostrar loading no botão
    const originalText = toggleButton.innerHTML;
    toggleButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Alternando...';
    toggleButton.disabled = true;
    
    // Fazer requisição AJAX
    fetch(toggleUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrfToken,
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Atualizar interface
            updateViewModeUI(data.user_view_mode, data.new_mode);
            showAlert(data.message, 'success');
            
            // Recarregar página após um breve delay para mostrar o feedback
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showAlert('Erro ao alternar modo de visualização', 'error');
        }
    })
    .catch(error => {
        console.error('Erro no toggle:', error);
        showAlert('Erro de conexão. Tente novamente.', 'error');
    })
    .finally(() => {
        // Restaurar botão
        if (toggleButton) {
            toggleButton.innerHTML = originalText;
            toggleButton.disabled = false;
        }
    });
}

function updateViewModeUI(userViewMode, modeName) {
    const body = document.body;
    const toggleButton = document.getElementById('toggleViewMode');
    
    if (userViewMode) {
        // Ativar modo usuário
        body.classList.add('user-view-mode');
        if (toggleButton) {
            toggleButton.innerHTML = '<i class="fas fa-cog"></i> Ver como Técnico';
        }
    } else {
        // Voltar para modo técnico
        body.classList.remove('user-view-mode');
        if (toggleButton) {
            toggleButton.innerHTML = '<i class="fas fa-eye"></i> Ver como Usuário';
        }
    }
}

function checkViewMode() {
    // Verificar modo atual via classe no body ou atributo data
    const body = document.body;
    const userViewMode = body.classList.contains('user-view-mode');
    
    if (userViewMode) {
        console.log('Modo Usuário ativo');
    } else {
        console.log('Modo Técnico ativo');
    }
}

function setupFormValidation() {
    // Validação em tempo real para formulários
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                
                // Focar no primeiro campo inválido
                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
            }
            form.classList.add('was-validated');
        });
        
        // Validação em tempo real nos campos
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(function(input) {
            input.addEventListener('blur', function() {
                if (this.checkValidity()) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                }
            });
        });
    });
}

function showAlert(message, type = 'info') {
    // Mapear tipos para classes Bootstrap
    const typeMap = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning',
        'info': 'info'
    };
    
    const alertType = typeMap[type] || 'info';
    
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${alertType} alert-dismissible fade show`;
    alertContainer.innerHTML = `
        <i class="fas fa-${getIconForType(type)} mr-2"></i>
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    
    const main = document.querySelector('main');
    if (main) {
        main.insertBefore(alertContainer, main.firstChild);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (alertContainer.parentNode) {
                alertContainer.remove();
            }
        }, 5000);
    }
}

function getIconForType(type) {
    const iconMap = {
        'success': 'check-circle',
        'error': 'exclamation-triangle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return iconMap[type] || 'info-circle';
}

function showLoading(element, text = 'Carregando...') {
    element.innerHTML = `
        <div class="text-center py-3">
            <div class="loading-spinner"></div>
            <small class="ml-2 text-muted">${text}</small>
        </div>
    `;
}

function hideLoading(element, originalContent) {
    element.innerHTML = originalContent;
}

// Função para validar formulários
function validateForm(formElement) {
    let isValid = true;
    
    // Validar campos obrigatórios
    formElement.querySelectorAll('input[required], textarea[required], select[required]').forEach(function(field) {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        }
    });
    
    return isValid;
}

// Função para formatar SQL (básica)
function formatSQL(sql) {
    return sql
        .replace(/\bSELECT\b/gi, 'SELECT')
        .replace(/\bFROM\b/gi, '\nFROM')
        .replace(/\bWHERE\b/gi, '\nWHERE')
        .replace(/\bORDER BY\b/gi, '\nORDER BY')
        .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
        .replace(/\bHAVING\b/gi, '\nHAVING');
}

// Função para copiar texto para clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            showAlert('Texto copiado para a área de transferência!', 'success');
        });
    } else {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showAlert('Texto copiado para a área de transferência!', 'success');
    }
}

// Função para debounce (útil para pesquisas)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Utilities para requisições AJAX
function makeAjaxRequest(url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrfToken,
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
    };
    
    return fetch(url, { ...defaultOptions, ...options });
}

// Event listener para teclas de atalho
document.addEventListener('keydown', function(e) {
    // Ctrl+Shift+T = Toggle view mode (só para técnicos)
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyT') {
        const toggleButton = document.getElementById('toggleViewMode');
        if (toggleButton && !toggleButton.disabled) {
            e.preventDefault();
            toggleUserViewMode();
        }
    }
    
    // Esc = Fechar modais/alerts
    if (e.code === 'Escape') {
        const alert = document.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }
});