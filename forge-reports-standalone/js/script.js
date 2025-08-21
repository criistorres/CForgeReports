// ForgeReports - Scripts Principais

// Função para alternar entre visões
function showTechnicianView() {
    document.getElementById('technicianView').classList.remove('hidden');
    document.getElementById('userView').classList.add('hidden');
    
    // Atualizar botões ativos
    updateViewButtons('technician');
}

function showUserView() {
    document.getElementById('userView').classList.remove('hidden');
    document.getElementById('technicianView').classList.add('hidden');
    
    // Atualizar botões ativos
    updateViewButtons('user');
}

function updateViewButtons(activeView) {
    const techButton = document.querySelector('[onclick="showTechnicianView()"]');
    const userButton = document.querySelector('[onclick="showUserView()"]');
    
    if (activeView === 'technician') {
        techButton.classList.add('btn-primary');
        techButton.classList.remove('btn-secondary');
        userButton.classList.add('btn-secondary');
        userButton.classList.remove('btn-primary');
    } else {
        userButton.classList.add('btn-primary');
        userButton.classList.remove('btn-secondary');
        techButton.classList.add('btn-secondary');
        techButton.classList.remove('btn-primary');
    }
}

// Navegação por abas
function setActiveTab(tabElement, tabId) {
    // Remove active de todas as abas
    document.querySelectorAll('.tab-nav a').forEach(tab => {
        tab.classList.remove('tab-active');
        tab.classList.add('text-gray-400');
        tab.classList.remove('text-white');
    });
    
    // Adiciona active na aba clicada
    tabElement.classList.add('tab-active');
    tabElement.classList.remove('text-gray-400');
    tabElement.classList.add('text-white');
    
    // Aqui você pode adicionar lógica para mostrar/esconder conteúdo das abas
    console.log('Aba ativa:', tabId);
}

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
        switch(e.key) {
            case 'k':
                e.preventDefault();
                const searchInput = document.querySelector('input[type="text"]');
                if (searchInput) {
                    searchInput.focus();
                }
                break;
            case 'r':
                e.preventDefault();
                console.log('Novo relatório - atalho');
                // Aqui você pode abrir modal de novo relatório
                break;
            case 'd':
                e.preventDefault();
                console.log('Nova conexão - atalho');
                // Aqui você pode abrir modal de nova conexão
                break;
            case 'u':
                e.preventDefault();
                console.log('Novo usuário - atalho');
                // Aqui você pode abrir modal de novo usuário
                break;
        }
    }
});

// Funções para gerenciamento de modais
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }
}

// Fechar modal ao clicar fora
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });
        document.body.style.overflow = 'auto';
    }
});

// Funções para notificações
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type} fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm`;
    
    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <i class="${icon}"></i>
            <span class="text-sm">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-gray-400 hover:text-white">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fas fa-check-circle text-green-400';
        case 'error': return 'fas fa-exclamation-circle text-red-400';
        case 'warning': return 'fas fa-exclamation-triangle text-yellow-400';
        default: return 'fas fa-info-circle text-blue-400';
    }
}

// Funções para gerenciamento de dados
function toggleFavorite(reportId) {
    // Aqui você faria a chamada para a API do Django
    console.log('Toggle favorite para relatório:', reportId);
    showNotification('Relatório adicionado aos favoritos', 'success');
}

function executeReport(reportId) {
    console.log('Executando relatório:', reportId);
    showNotification('Relatório sendo executado...', 'info');
    
    // Simular execução
    setTimeout(() => {
        showNotification('Relatório executado com sucesso', 'success');
    }, 2000);
}

function deleteItem(itemType, itemId) {
    if (confirm(`Tem certeza que deseja excluir este ${itemType}?`)) {
        console.log(`Excluindo ${itemType}:`, itemId);
        showNotification(`${itemType} excluído com sucesso`, 'success');
    }
}

// Funções para filtros e busca
function filterItems(searchTerm) {
    const items = document.querySelectorAll('.filterable-item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Debounce para busca
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

// Aplicar debounce na busca
const debouncedFilter = debounce(filterItems, 300);

// Event listeners para busca
document.addEventListener('DOMContentLoaded', () => {
    const searchInputs = document.querySelectorAll('input[type="text"]');
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            debouncedFilter(e.target.value);
        });
    });
});

// Funções para validação de formulários
function validateForm(formId) {
    const form = document.getElementById(formId);
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('border-red-500');
            isValid = false;
        } else {
            field.classList.remove('border-red-500');
        }
    });
    
    return isValid;
}

// Funções para conexões de banco
function testConnection(connectionId) {
    console.log('Testando conexão:', connectionId);
    showNotification('Testando conexão...', 'info');
    
    // Simular teste de conexão
    setTimeout(() => {
        const success = Math.random() > 0.3; // 70% de chance de sucesso
        if (success) {
            showNotification('Conexão testada com sucesso', 'success');
        } else {
            showNotification('Falha na conexão', 'error');
        }
    }, 1500);
}

// Funções para gerenciamento de usuários
function toggleUserStatus(userId) {
    console.log('Alterando status do usuário:', userId);
    showNotification('Status do usuário alterado', 'success');
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('ForgeReports carregado');
    
    // Definir visão padrão
    showTechnicianView();
    
    // Adicionar event listeners para navegação
    const navLinks = document.querySelectorAll('.tab-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('href').substring(1);
            setActiveTab(link, tabId);
        });
    });
});

// Funções utilitárias
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Exportar funções para uso global
window.ForgeReports = {
    showTechnicianView,
    showUserView,
    setActiveTab,
    openModal,
    closeModal,
    showNotification,
    toggleFavorite,
    executeReport,
    deleteItem,
    filterItems,
    validateForm,
    testConnection,
    toggleUserStatus,
    formatDate,
    formatFileSize
};

