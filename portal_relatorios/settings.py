# portal_relatorios/settings.py - PRIMEIRA LINHA: Settings atualizados para ForgeReports modernizado

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-forge-reports-development-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'] + (
    os.getenv('ALLOWED_HOSTS', '').split(',') if os.getenv('ALLOWED_HOSTS') else []
)

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'bootstrap4',  # Mantido para compatibilidade com forms Django
    
    # Local apps
    'core',
    'users',
    'reports',
    'connections',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    # Custom middlewares para ForgeReports
    'core.middleware.SecurityHeadersMiddleware',
    'core.middleware.AccessControlMiddleware', 
    'core.middleware.UserViewModeMiddleware',
    'core.middleware.AuditMiddleware',
]

ROOT_URLCONF = 'portal_relatorios.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                
                # Custom context processors
                'core.context_processors.forge_context',
            ],
        },
    },
]

WSGI_APPLICATION = 'portal_relatorios.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ===== FORGE REPORTS SPECIFIC SETTINGS =====

# Authentication settings
LOGIN_URL = 'core:login'
LOGIN_REDIRECT_URL = 'core:dashboard'
LOGOUT_REDIRECT_URL = 'core:home'

# Session settings
SESSION_COOKIE_AGE = 3600 * 8  # 8 horas
SESSION_SAVE_EVERY_REQUEST = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_SECURE = not DEBUG  # True em produção
SESSION_COOKIE_HTTPONLY = True

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG

# CSRF settings
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_HTTPONLY = True
CSRF_TRUSTED_ORIGINS = ['http://localhost:8000', 'http://127.0.0.1:8000']

# Message framework settings
from django.contrib.messages import constants as messages
MESSAGE_TAGS = {
    messages.DEBUG: 'info',
    messages.INFO: 'info',
    messages.SUCCESS: 'success',
    messages.WARNING: 'warning',
    messages.ERROR: 'error',
}

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
        'forge': {
            'format': '[ForgeReports] {asctime} {levelname} {name}: {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'forge_reports.log',
            'maxBytes': 1024*1024*10,  # 10MB
            'backupCount': 10,
            'formatter': 'forge',
        },
        'console': {
            'level': 'DEBUG' if DEBUG else 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'security': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'security.log',
            'maxBytes': 1024*1024*5,  # 5MB
            'backupCount': 5,
            'formatter': 'forge',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'forge_reports': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'core': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'connections': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'reports': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'security': {
            'handlers': ['security', 'console'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}

# Cache configuration (preparado para Redis no futuro)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'forge-reports-cache',
        'TIMEOUT': 300,
        'OPTIONS': {
            'MAX_ENTRIES': 1000,
        }
    }
}

# ===== FORGE REPORTS BUSINESS SETTINGS =====

# Configurações de conexão de banco
FORGE_DB_CONNECTION_TIMEOUT = 30  # segundos
FORGE_DB_QUERY_TIMEOUT = 300  # 5 minutos
FORGE_MAX_QUERY_RESULTS = 10000  # máximo de linhas por resultado

# Configurações de arquivos
FORGE_MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
FORGE_ALLOWED_EXPORT_FORMATS = ['xlsx', 'csv', 'pdf']

# Configurações de segurança específicas
FORGE_PASSWORD_ENCRYPTION = False  # MVP: senhas em texto puro
FORGE_AUDIT_LOG_RETENTION_DAYS = 90
FORGE_MAX_LOGIN_ATTEMPTS = 5
FORGE_LOGIN_ATTEMPT_TIMEOUT = 300  # 5 minutos

# Configurações de interface
FORGE_ITEMS_PER_PAGE = 25
FORGE_DASHBOARD_REFRESH_INTERVAL = 30  # segundos
FORGE_SIDEBAR_COLLAPSED_DEFAULT = False

# ===== ENVIRONMENT SPECIFIC OVERRIDES =====

if DEBUG:
    # Development specific settings
    LOGGING['handlers']['console']['level'] = 'DEBUG'
    
    # Disable some security features in development
    SECURE_SSL_REDIRECT = False
    SECURE_HSTS_SECONDS = 0
    
    # Debug toolbar (opcional)
    try:
        import debug_toolbar
        INSTALLED_APPS.append('debug_toolbar')
        MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
        INTERNAL_IPS = ['127.0.0.1', 'localhost']
    except ImportError:
        pass

else:
    # Production specific settings
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    
    # Database para produção (exemplo PostgreSQL)
    if os.getenv('DATABASE_URL'):
        import dj_database_url
        DATABASES['default'] = dj_database_url.parse(os.getenv('DATABASE_URL'))
    
    # Logging mais restritivo em produção
    LOGGING['handlers']['console']['level'] = 'WARNING'

# ===== BOOTSTRAP 4 SETTINGS (para compatibilidade) =====
BOOTSTRAP4 = {
    'include_jquery': False,  # Usar CDN
    'javascript_in_head': False,
    'theme_url': None,
    'css_url': None,  # Usar Tailwind como principal
}

# ===== CUSTOM CONTEXT VARIABLES =====
FORGE_VERSION = '2.0.0'
FORGE_BUILD_DATE = '2025-07-29'
FORGE_ENVIRONMENT = 'development' if DEBUG else 'production'

# Criar diretório de logs se não existir
os.makedirs(BASE_DIR / 'logs', exist_ok=True)

# ===== ADMIN CUSTOMIZATION =====
ADMIN_SITE_HEADER = "ForgeReports - Administração"
ADMIN_SITE_TITLE = "ForgeReports Admin"
ADMIN_INDEX_TITLE = "Painel Administrativo"