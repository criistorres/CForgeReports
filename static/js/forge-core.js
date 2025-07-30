// forge-core.js - PRIMEIRA LINHA: JavaScript principal do ForgeReports com funcionalidades base

class ForgeCore {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.setupNavbar();
        this.setupCSRF();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.handleMobileMenu();
            this.handleUserDropdown();
            this.handleToggleViewMode();
            this.setupFormValidation();
            this.initializeTooltips();
        });

        window.addEventListener('scroll', () => {
            this.handleNavbarScroll();
        });
    }

    initializeComponents() {
        // Auto-remover alerts após 5 segundos
        document.querySelectorAll('.alert-forge').forEach(alert => {
            setTimeout(() => {
                this.removeAlert(alert);
            }, 5000);
        });

        // Inicializar dropdowns
        this.initializeDropdowns();
        
        // Setup de forms
        this.enhanceForms();
    }

    // ===== NAVBAR FUNCTIONALITY =====
    handleMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const sidebar = document.getElementById('sidebar');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                
                // Toggle sidebar no mobile
                if (sidebar) {
                    sidebar.classList.toggle('open');
                }
            });
        }
    }

    handleNavbarScroll() {
        const navbar = document.getElementById('main-navbar');
        if (!navbar) return;

        const scrolled = window.scrollY;
        const threshold = 100;

        if (scrolled > threshold) {
            navbar.classList.remove('navbar-transparent');
            navbar.classList.add('navbar-solid');
        } else {
            navbar.classList.remove('navbar-solid');
            navbar.classList.add('navbar-transparent');
        }
    }

    setupNavbar() {
        // Marcar link ativo baseado na URL atual
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link-enhanced').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }

    // ===== USER DROPDOWN =====
    handleUserDropdown() {
        // Já gerenciado pelo Alpine.js no template
        // Aqui podemos adicionar funcionalidades extras se necessário
    }

    // ===== TOGGLE VIEW MODE =====
    handleToggleViewMode() {
        const toggleButton = document.getElementById('toggleViewMode');
        
        if (!toggleButton) return;

        toggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleUserViewMode();
        });
    }

    async toggleUserViewMode() {
        const toggleButton = document.getElementById('toggleViewMode');
        const toggleUrl = toggleButton.getAttribute('data-url');
        
        if (!toggleUrl) {
            this.showNotification('Erro: URL de toggle não configurada', 'error');
            return;
        }

        // Mostrar loading
        const originalText = toggleButton.innerHTML;
        toggleButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Alternando...';
        toggleButton.disabled = true;

        try {
            const response = await fetch(toggleUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': window.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.showNotification(data.message, 'success');
                
                // Recarregar página após feedback
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                this.showNotification('Erro ao alternar modo de visualização', 'error');
            }
        } catch (error) {
            console.error('Erro no toggle:', error);
            this.showNotification('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Restaurar botão
            toggleButton.innerHTML = originalText;
            toggleButton.disabled = false;
        }
    }

    // ===== CSRF SETUP =====
    setupCSRF() {
        // CSRF token já configurado no template
        // Verificar se está disponível
        if (!window.csrfToken) {
            console.warn('CSRF token não encontrado');
        }
    }

    // ===== FORM VALIDATION =====
    setupFormValidation() {
        document.querySelectorAll('form').forEach(form => {
            this.enhanceForm(form);
        });
    }

    enhanceForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Adicionar classes do Forge
            if (!input.classList.contains('input-forge') && !input.classList.contains('input-forge-dark')) {
                if (document.body.classList.contains('bg-slate-900')) {
                    input.classList.add('input-forge-dark');
                } else {
                    input.classList.add('input-forge');
                }
            }

            // Validação em tempo real
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) {
                    this.validateField(input);
                }
            });
        });

        // Interceptar submit
        form.addEventListener('submit', (e) => {
            if (!this.validateForm(form)) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    validateField(field) {
        const isValid = field.checkValidity();
        
        field.classList.remove('is-valid', 'is-invalid');
        
        if (field.value.trim() !== '') {
            field.classList.add(isValid ? 'is-valid' : 'is-invalid');
        }
        
        return isValid;
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            const firstInvalid = form.querySelector('.is-invalid');
            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return isValid;
    }

    enhanceForms() {
        // Adicionar efeito ripple aos botões
        document.querySelectorAll('button, .btn-forge-primary, .btn-forge-secondary').forEach(btn => {
            if (!btn.classList.contains('btn-ripple')) {
                btn.classList.add('btn-ripple');
            }
        });
    }

    // ===== DROPDOWNS =====
    initializeDropdowns() {
        document.querySelectorAll('.dropdown-forge').forEach(dropdown => {
            const trigger = dropdown.querySelector('[data-dropdown-trigger]');
            const content = dropdown.querySelector('.dropdown-content');
            
            if (trigger && content) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleDropdown(content);
                });
            }
        });

        // Fechar dropdowns ao clicar fora
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-content.show').forEach(content => {
                content.classList.remove('show');
            });
        });
    }

    toggleDropdown(content) {
        // Fechar outros dropdowns
        document.querySelectorAll('.dropdown-content.show').forEach(other => {
            if (other !== content) {
                other.classList.remove('show');
            }
        });

        content.classList.toggle('show');
    }

    // ===== TOOLTIPS =====
    initializeTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            this.createTooltip(element);
        });
    }

    createTooltip(element) {
        const text = element.getAttribute('data-tooltip');
        const position = element.getAttribute('data-tooltip-position') || 'top';
        
        let tooltip = null;

        element.addEventListener('mouseenter', () => {
            tooltip = document.createElement('div');
            tooltip.className = `tooltip-forge ${position}`;
            tooltip.textContent = text;
            document.body.appendChild(tooltip);

            const rect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            let top, left;

            switch (position) {
                case 'top':
                    top = rect.top - tooltipRect.height - 10;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + 10;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
                    break;
                case 'left':
                    top = rect.top + (rect.height - tooltipRect.height) / 2;
                    left = rect.left - tooltipRect.width - 10;
                    break;
                case 'right':
                    top = rect.top + (rect.height - tooltipRect.height) / 2;
                    left = rect.right + 10;
                    break;
            }

            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;

            setTimeout(() => tooltip.classList.add('show'), 10);
        });

        element.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.classList.remove('show');
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 200);
            }
        });
    }

    // ===== NOTIFICATIONS =====
    showNotification(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        document.body.appendChild(notification);

        // Animação de entrada
        setTimeout(() => {
            notification.classList.add('notification-enter-active');
        }, 10);

        // Auto-remover
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `alert-forge ${type} notification-enter fixed top-24 right-6 z-50 max-w-sm`;
        notification.style.transform = 'translateX(100%)';
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="ml-auto text-current opacity-70 hover:opacity-100" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        return notification;
    }

    removeNotification(notification) {
        notification.classList.add('notification-exit-active');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    removeAlert(alert) {
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }

    // ===== UTILITY METHODS =====
    debounce(func, wait) {
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

    async makeRequest(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': window.csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    }

    // ===== LOADING STATES =====
    showLoading(element, text = 'Carregando...') {
        element.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <div class="loading-forge mr-3"></div>
                <span class="text-slate-400">${text}</span>
            </div>
        `;
    }

    hideLoading(element, originalContent) {
        element.innerHTML = originalContent;
    }

    // ===== MODAL HELPER =====
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('modal-enter-active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('modal-exit-active');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('modal-enter-active', 'modal-exit-active');
            }, 200);
        }
    }
}

// Inicializar quando DOM estiver pronto
const forge = new ForgeCore();

// Exportar para uso global
window.ForgeCore = forge;