# core/context_processors.py - PRIMEIRA LINHA: Context processors customizados para ForgeReports

from django.conf import settings
from django.contrib.auth.models import Group
from connections.models import DatabaseConnection
from reports.models import Report, ReportFolder
import datetime


def forge_context(request):
    """
    Context processor que adiciona variáveis globais específicas do ForgeReports
    """
    context = {
        # Informações da aplicação
        'forge_version': getattr(settings, 'FORGE_VERSION', '2.0.0'),
        'forge_build_date': getattr(settings, 'FORGE_BUILD_DATE', '2025-07-29'),
        'forge_environment': getattr(settings, 'FORGE_ENVIRONMENT', 'development'),
        'current_year': datetime.datetime.now().year,
        
        # Configurações de interface
        'sidebar_collapsed': request.session.get('sidebar_collapsed', False),
        'items_per_page': getattr(settings, 'FORGE_ITEMS_PER_PAGE', 25),
        'dashboard_refresh_interval': getattr(settings, 'FORGE_DASHBOARD_REFRESH_INTERVAL', 30),
    }
    
    # Informações do usuário se autenticado
    if request.user.is_authenticated:
        # Verificar se é técnico
        is_tecnico = request.user.groups.filter(name='Tecnicos').exists()
        
        # Modo de visualização (para técnicos)
        user_view_mode = request.session.get('user_view_mode', False)
        effective_user_mode = user_view_mode and is_tecnico
        
        context.update({
            'is_tecnico': is_tecnico,
            'user_view_mode': user_view_mode,
            'effective_user_mode': effective_user_mode,
            'user_full_name': request.user.get_full_name() or request.user.username,
            'user_groups': list(request.user.groups.values_list('name', flat=True)),
        })
        
        # Estatísticas para o sidebar e dashboard
        try:
            if is_tecnico:
                # Estatísticas completas para técnicos
                context.update({
                    'connections_count': DatabaseConnection.objects.filter(ativo=True).count(),
                    'reports_count': Report.objects.filter(ativo=True).count(),
                    'folders_count': ReportFolder.objects.count(),
                    'total_users': request.user.__class__.objects.count(),
                })
            else:
                # Estatísticas limitadas para usuários
                user_reports = Report.objects.filter(
                    ativo=True,
                    usuarios_permitidos=request.user
                )
                context.update({
                    'user_reports_count': user_reports.count(),
                    'available_reports': user_reports.count(),
                })
        
        except Exception as e:
            # Em caso de erro (ex: tabelas não criadas ainda), usar valores padrão
            context.update({
                'connections_count': 0,
                'reports_count': 0,
                'folders_count': 0,
                'total_users': 0,
                'user_reports_count': 0,
                'available_reports': 0,
            })
    
    # Informações de sistema/status
    context.update({
        'system_status': 'online',  # Pode ser expandido para verificações reais
        'last_backup': None,  # Para implementar no futuro
        'maintenance_mode': False,  # Para implementar no futuro
    })
    
    return context


def forge_navigation(request):
    """
    Context processor para dados de navegação dinâmica
    """
    context = {}
    
    if request.user.is_authenticated:
        # Breadcrumb automático baseado na URL
        path_parts = request.path.strip('/').split('/')
        breadcrumb = []
        
        # Mapping de URLs para nomes legíveis
        url_names = {
            '': 'Início',
            'dashboard': 'Dashboard',
            'connections': 'Conexões',
            'reports': 'Relatórios',
            'users': 'Usuários',
            'admin': 'Administração',
        }
        
        current_path = ''
        for part in path_parts:
            if part:
                current_path += f'/{part}'
                name = url_names.get(part, part.title())
                breadcrumb.append({
                    'name': name,
                    'url': current_path,
                    'active': False
                })
        
        # Marcar último item como ativo
        if breadcrumb:
            breadcrumb[-1]['active'] = True
        
        context['breadcrumb'] = breadcrumb
        
        # Menu lateral dinâmico (estrutura básica)
        context['sidebar_menu'] = get_sidebar_menu(request.user)
    
    return context


def get_sidebar_menu(user):
    """
    Gera estrutura do menu lateral baseado nas permissões do usuário
    """
    menu = []
    
    # Dashboard sempre presente
    menu.append({
        'name': 'Dashboard',
        'icon': 'fas fa-tachometer-alt',
        'url': '/dashboard/',
        'active': False,
        'children': []
    })
    
    # Menu para técnicos
    if user.groups.filter(name='Tecnicos').exists():
        menu.extend([
            {
                'name': 'Conexões',
                'icon': 'fas fa-database',
                'url': '/connections/',
                'active': False,
                'children': []
            },
            {
                'name': 'Relatórios',
                'icon': 'fas fa-file-alt',
                'url': '/reports/',
                'active': False,
                'children': [
                    {
                        'name': 'Gerenciar',
                        'url': '/reports/manage/',
                    },
                    {
                        'name': 'Pastas',
                        'url': '/reports/folders/',
                    }
                ]
            },
            {
                'name': 'Usuários',
                'icon': 'fas fa-users',
                'url': '/users/',
                'active': False,
                'children': []
            }
        ])
    
    # Relatórios para usuários (será expandido dinamicamente)
    reports_menu = {
        'name': 'Relatórios',
        'icon': 'fas fa-chart-bar',
        'url': '/reports/view/',
        'active': False,
        'children': []
    }
    
    # Aqui seria carregada a estrutura de pastas/relatórios
    # Por enquanto, estrutura básica
    if user.groups.filter(name='Usuarios').exists() or user.groups.filter(name='Tecnicos').exists():
        menu.append(reports_menu)
    
    return menu


def forge_theme(request):
    """
    Context processor para configurações de tema/aparência
    """
    # Tema padrão (pode ser personalizado por usuário no futuro)
    theme_config = {
        'primary_color': '#a855f7',
        'secondary_color': '#06d6a0',
        'dark_mode': request.session.get('dark_mode', True),  # ForgeReports é dark por padrão
        'sidebar_style': request.session.get('sidebar_style', 'expanded'),
        'animation_speed': 'normal',
        'border_radius': 'rounded',
    }
    
    return {'theme_config': theme_config}


def forge_performance(request):
    """
    Context processor para métricas de performance (desenvolvimento)
    """
    if not settings.DEBUG:
        return {}
    
    import time
    
    # Tempo de início da requisição (seria configurado em middleware)
    start_time = getattr(request, '_forge_start_time', time.time())
    
    return {
        'performance': {
            'request_start': start_time,
            'debug_mode': settings.DEBUG,
            'db_queries': 0,  # Seria calculado em middleware
        }
    }