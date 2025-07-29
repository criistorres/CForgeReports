// ForgeReports - Scripts JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes da página
    initializeComponents();
    
    // Configurar eventos
    setupEventListeners();
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
}

function setupEventListeners() {
    // Toggle entre modo técnico e usuário
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
}

function loadFolderStructure() {
    const foldersContainer = document.getElementById('report-folders');
    if (!foldersContainer) return;
    
    // Simular carregamento das pastas (será implementado com AJAX na Fase 4)
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

function toggleUserViewMode() {
    const body = document.body;
    const toggleButton = document.getElementById('toggleViewMode');
    
    if (body.classList.contains('user-view-mode')) {
        // Voltar para modo técnico
        body.classList.remove('user-view-mode');
        toggleButton.innerHTML = '<i class="fas fa-eye"></i> Ver como Usuário';
        showAlert('Modo Técnico ativado', 'info');
    } else {
        // Ativar modo usuário
        body.classList.add('user-view-mode');
        toggleButton.innerHTML = '<i class="fas fa-cog"></i> Ver como Técnico';
        showAlert('Modo Usuário ativado', 'info');
    }
}

function showAlert(message, type = 'info') {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show`;
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    
    const main = document.querySelector('main');
    main.insertBefore(alertContainer, main.firstChild);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (alertContainer.parentNode) {
            alertContainer.remove();
        }
    }, 5000);
}

function showLoading(element, text = 'Carregando...') {
    element.innerHTML = `
        <div class="text-center">
            <div class="loading-spinner"></div>
            <small class="ml-2">${text}</small>
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