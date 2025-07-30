// forge-effects.js - PRIMEIRA LINHA: Efeitos visuais avançados para o ForgeReports

class ForgeEffects {
    constructor() {
        this.effects = new Map();
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeEffects();
        });
    }

    initializeEffects() {
        this.initTypewriter();
        this.initStatsOrbit();
        this.initIntersectionObserver();
        this.initParallaxEffects();
    }

    // ===== TYPEWRITER EFFECT =====
    initTypewriter() {
        const typewriterElements = document.querySelectorAll('[data-typewriter]');
        
        typewriterElements.forEach(element => {
            const words = element.getAttribute('data-typewriter').split(',');
            const speed = parseInt(element.getAttribute('data-typewriter-speed')) || 150;
            const deleteSpeed = parseInt(element.getAttribute('data-typewriter-delete-speed')) || 100;
            const pauseDelay = parseInt(element.getAttribute('data-typewriter-pause')) || 2000;
            
            const typewriter = new TypewriterEffect(element, words, {
                typeSpeed: speed,
                deleteSpeed: deleteSpeed,
                pauseDelay: pauseDelay
            });
            
            this.effects.set(element, typewriter);
        });
    }

    // ===== STATS ORBIT ANIMATION =====
    initStatsOrbit() {
        const orbitContainers = document.querySelectorAll('.stats-orbit');
        
        orbitContainers.forEach(container => {
            this.createStatsOrbit(container);
        });
    }

    createStatsOrbit(container) {
        const data = JSON.parse(container.getAttribute('data-stats') || '[]');
        
        if (data.length === 0) return;

        // Criar centro
        const center = document.createElement('div');
        center.className = 'stats-center';
        center.innerHTML = '<span class="text-white font-bold text-sm">STATS</span>';
        container.appendChild(center);

        // Criar planetas
        data.forEach((stat, index) => {
            const planet = document.createElement('div');
            planet.className = `stats-planet ${stat.type}`;
            planet.innerHTML = `
                <div class="text-center">
                    <div class="text-xs font-bold">${stat.value}</div>
                    <div class="text-xs opacity-80">${stat.label}</div>
                </div>
            `;
            
            // Tooltip
            planet.setAttribute('data-tooltip', `${stat.label}: ${stat.value}`);
            planet.setAttribute('data-tooltip-position', 'top');
            
            container.appendChild(planet);
        });
    }

    // ===== INTERSECTION OBSERVER PARA ANIMAÇÕES =====
    initIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerEnterAnimation(entry.target);
                }
            });
        }, observerOptions);

        // Observar elementos com animações
        document.querySelectorAll('.animate-slide-up, .animate-fade-in').forEach(el => {
            observer.observe(el);
        });

        // Observar cards para animação escalonada
        document.querySelectorAll('.dashboard-card, .card-forge').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            observer.observe(card);
        });
    }

    triggerEnterAnimation(element) {
        if (element.classList.contains('animate-slide-up')) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
        
        if (element.classList.contains('animate-fade-in')) {
            element.style.opacity = '1';
        }

        // Adicionar efeito para cards
        if (element.classList.contains('dashboard-card') || element.classList.contains('card-forge')) {
            element.style.animation = 'slideUp 0.8s ease-out forwards';
        }
    }

    // ===== PARALLAX EFFECTS =====
    initParallaxEffects() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (parallaxElements.length === 0) return;

        window.addEventListener('scroll', this.debounce(() => {
            this.updateParallax();
        }, 10));
    }

    updateParallax() {
        const scrolled = window.pageYOffset;
        
        // Gradientes de fundo
        const liquidBg = document.querySelector('.liquid-gradient');
        const liquidBgAlt = document.querySelector('.liquid-gradient-alt');
        
        if (liquidBg) {
            liquidBg.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
        if (liquidBgAlt) {
            liquidBgAlt.style.transform = `translateY(${scrolled * -0.05}px)`;
        }

        // Elementos com data-parallax
        document.querySelectorAll('[data-parallax]').forEach(element => {
            const speed = parseFloat(element.getAttribute('data-parallax')) || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    // ===== FLOATING ANIMATION =====
    initFloatingElements() {
        document.querySelectorAll('.float-animation').forEach((element, index) => {
            element.style.animationDelay = `${index * 0.5}s`;
        });
    }

    // ===== SPARKLE EFFECT =====
    addSparkleEffect(element) {
        element.classList.add('sparkle');
        
        // Remover após animação
        setTimeout(() => {
            element.classList.remove('sparkle');
        }, 4000);
    }

    // ===== LOADING STATES AVANÇADOS =====
    showSkeletonLoader(element, rows = 3) {
        const skeleton = document.createElement('div');
        skeleton.className = 'space-y-3';
        
        for (let i = 0; i < rows; i++) {
            const row = document.createElement('div');
            row.className = 'skeleton h-4 rounded';
            skeleton.appendChild(row);
        }
        
        element.innerHTML = '';
        element.appendChild(skeleton);
    }

    showLoadingDots(element, text = 'Carregando') {
        element.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <span class="mr-3 text-slate-400">${text}</span>
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
        `;
    }

    // ===== PROGRESS ANIMATIONS =====
    animateProgress(progressBar, targetValue, duration = 1000) {
        const fill = progressBar.querySelector('.progress-fill');
        if (!fill) return;

        let currentValue = 0;
        const increment = targetValue / (duration / 16); // 60fps

        const animate = () => {
            currentValue += increment;
            
            if (currentValue >= targetValue) {
                currentValue = targetValue;
            }
            
            fill.style.width = `${currentValue}%`;
            
            if (currentValue < targetValue) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // ===== CARD FLIP EFFECT =====
    addCardFlipEffect(card, frontContent, backContent) {
        card.classList.add('card-flip');
        
        const inner = document.createElement('div');
        inner.className = 'card-flip-inner';
        
        const front = document.createElement('div');
        front.className = 'card-flip-front';
        front.innerHTML = frontContent;
        
        const back = document.createElement('div');
        back.className = 'card-flip-back';
        back.innerHTML = backContent;
        
        inner.appendChild(front);
        inner.appendChild(back);
        
        card.innerHTML = '';
        card.appendChild(inner);
    }

    // ===== TYPING INDICATOR =====
    showTypingIndicator(element) {
        element.innerHTML = `
            <div class="flex items-center space-x-2 text-slate-400">
                <span>Digitando</span>
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
        `;
    }

    // ===== PULSE EFFECT =====
    addPulseEffect(element, color = 'purple') {
        element.classList.add('connection-pulse');
        
        const colorMap = {
            purple: '#a855f7',
            green: '#10b981',
            blue: '#3b82f6',
            red: '#ef4444',
            yellow: '#f59e0b'
        };
        
        element.style.setProperty('--pulse-color', colorMap[color] || colorMap.purple);
    }

    // ===== SMOOTH SCROLL =====
    smoothScrollTo(target, duration = 800) {
        const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
        
        if (!targetElement) return;

        const targetPosition = targetElement.offsetTop - 100; // Offset para navbar
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }

    // ===== EASING FUNCTIONS =====
    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
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

    // ===== CLEANUP =====
    destroy() {
        this.effects.forEach(effect => {
            if (effect.destroy) {
                effect.destroy();
            }
        });
        this.effects.clear();
    }
}

// ===== TYPEWRITER EFFECT CLASS =====
class TypewriterEffect {
    constructor(element, words, options = {}) {
        this.element = element;
        this.words = words;
        this.currentWordIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.typeSpeed = options.typeSpeed || 150;
        this.deleteSpeed = options.deleteSpeed || 100;
        this.pauseDelay = options.pauseDelay || 2000;
        
        this.setupElement();
        this.start();
    }
    
    setupElement() {
        this.element.innerHTML = `
            <span class="typewriter-visible"></span>
            <span class="terminal-cursor"></span>
        `;
        this.textElement = this.element.querySelector('.typewriter-visible');
    }
    
    start() {
        this.type();
    }
    
    type() {
        const currentWord = this.words[this.currentWordIndex];
        
        if (this.isDeleting) {
            // Deletando caracteres
            this.textElement.textContent = currentWord.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
            
            if (this.currentCharIndex === 0) {
                this.isDeleting = false;
                this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
                setTimeout(() => this.type(), 500);
                return;
            }
            
            setTimeout(() => this.type(), this.deleteSpeed);
        } else {
            // Escrevendo caracteres
            this.textElement.textContent = currentWord.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
            
            if (this.currentCharIndex === currentWord.length) {
                setTimeout(() => {
                    this.isDeleting = true;
                    this.type();
                }, this.pauseDelay);
                return;
            }
            
            setTimeout(() => this.type(), this.typeSpeed);
        }
    }
    
    destroy() {
        // Cleanup se necessário
    }
}

// Inicializar efeitos
const forgeEffects = new ForgeEffects();

// Exportar para uso global
window.ForgeEffects = forgeEffects;
window.TypewriterEffect = TypewriterEffect;