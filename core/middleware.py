from django.shortcuts import redirect
from django.contrib import messages
from django.urls import reverse
from django.utils.deprecation import MiddlewareMixin
import logging

logger = logging.getLogger(__name__)


class AccessControlMiddleware(MiddlewareMixin):
    """
    Middleware para controle de acesso baseado em grupos e URLs
    """
    
    # URLs que requerem perfil de técnico
    TECNICO_REQUIRED_URLS = [
        '/admin/',
        '/connections/',
        '/reports/manage/',
        '/users/manage/',
    ]
    
    # URLs que usuários podem acessar
    USUARIO_ALLOWED_URLS = [
        '/',
        '/dashboard/',
        '/reports/view/',
        '/reports/execute/',
        '/reports/export/',
    ]
    
    # URLs públicas (sem autenticação)
    PUBLIC_URLS = [
        '/',
        '/login/',
        '/logout/',
        '/static/',
        '/media/',
    ]
    
    def process_request(self, request):
        """
        Processa cada requisição para verificar permissões
        """
        path = request.path_info
        user = request.user
        
        # URLs públicas sempre permitidas
        if any(path.startswith(url) for url in self.PUBLIC_URLS):
            return None
        
        # Verificar se usuário está autenticado
        if not user.is_authenticated:
            if not any(path.startswith(url) for url in self.PUBLIC_URLS):
                messages.warning(
                    request, 
                    "Você precisa fazer login para acessar esta página."
                )
                return redirect(f'/admin/login/?next={path}')
        
        # Superuser tem acesso total
        if user.is_superuser:
            return None
        
        # Verificar URLs que requerem técnico
        if any(path.startswith(url) for url in self.TECNICO_REQUIRED_URLS):
            if not user.groups.filter(name='Tecnicos').exists():
                messages.error(
                    request,
                    "Esta área é restrita a usuários técnicos."
                )
                logger.warning(
                    f"Usuário {user.username} tentou acessar área técnica: {path}"
                )
                return redirect('core:dashboard')
        
        return None


class UserViewModeMiddleware(MiddlewareMixin):
    """
    Middleware para adicionar contexto de modo de visualização
    """
    
    def process_request(self, request):
        """
        Adiciona informações do modo de visualização no contexto da requisição
        """
        if request.user.is_authenticated:
            # Adicionar informação do modo atual à requisição
            request.user_view_mode = request.session.get('user_view_mode', False)
            request.is_tecnico = request.user.groups.filter(name='Tecnicos').exists()
            request.effective_user_mode = request.user_view_mode and request.is_tecnico
        
        return None


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware para adicionar cabeçalhos de segurança
    """
    
    def process_response(self, request, response):
        """
        Adiciona cabeçalhos de segurança nas respostas
        """
        # Prevenir clickjacking
        response['X-Frame-Options'] = 'DENY'
        
        # Prevenir MIME type sniffing
        response['X-Content-Type-Options'] = 'nosniff'
        
        # XSS Protection
        response['X-XSS-Protection'] = '1; mode=block'
        
        # Referrer Policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        return response


class AuditMiddleware(MiddlewareMixin):
    """
    Middleware para auditoria de acessos (logging)
    """
    
    SENSITIVE_PATHS = [
        '/admin/',
        '/connections/',
        '/reports/execute/',
    ]
    
    def process_request(self, request):
        """
        Log de acessos a áreas sensíveis
        """
        path = request.path_info
        user = request.user
        
        # Log apenas para caminhos sensíveis e usuários autenticados
        if user.is_authenticated and any(path.startswith(p) for p in self.SENSITIVE_PATHS):
            logger.info(
                f"Acesso sensível - Usuário: {user.username}, "
                f"Grupo: {user.groups.first().name if user.groups.exists() else 'None'}, "
                f"Path: {path}, IP: {self._get_client_ip(request)}"
            )
        
        return None
    
    def _get_client_ip(self, request):
        """
        Obtém o IP real do cliente
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')