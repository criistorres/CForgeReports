from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib import messages
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.core.exceptions import PermissionDenied


class GroupRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    """
    Mixin base para verificação de grupos de usuários
    """
    group_required = None
    login_url = '/admin/login/'
    permission_denied_message = "Você não tem permissão para acessar esta página."
    redirect_url = 'core:dashboard'
    
    def test_func(self):
        """Verifica se o usuário pertence ao grupo necessário"""
        if not self.group_required:
            return True
        
        user = self.request.user
        if user.is_authenticated:
            return user.groups.filter(name=self.group_required).exists()
        return False
    
    def handle_no_permission(self):
        """Customiza o tratamento quando não há permissão"""
        if self.request.user.is_authenticated:
            # Usuário logado mas sem permissão
            messages.error(
                self.request, 
                self.permission_denied_message
            )
            return redirect(self.redirect_url)
        else:
            # Usuário não logado
            messages.warning(
                self.request, 
                "Você precisa fazer login para acessar esta página."
            )
            return redirect(f"{self.login_url}?next={self.request.get_full_path()}")


class TecnicoRequiredMixin(GroupRequiredMixin):
    """
    Mixin para views que requerem perfil de Técnico
    """
    group_required = 'Tecnicos'
    permission_denied_message = (
        "Esta funcionalidade está disponível apenas para usuários técnicos. "
        "Entre em contato com o administrador se precisar de acesso."
    )


class UsuarioRequiredMixin(GroupRequiredMixin):
    """
    Mixin para views que requerem perfil de Usuário (ou superior)
    """
    group_required = 'Usuarios'
    permission_denied_message = (
        "Você não tem permissão para acessar relatórios. "
        "Entre em contato com o administrador para solicitar acesso."
    )
    
    def test_func(self):
        """
        Usuários podem acessar, técnicos também (pois têm todas as permissões)
        """
        user = self.request.user
        if user.is_authenticated:
            return (
                user.groups.filter(name='Usuarios').exists() or 
                user.groups.filter(name='Tecnicos').exists() or
                user.is_superuser
            )
        return False


class TecnicoOrOwnerMixin(LoginRequiredMixin):
    """
    Mixin para views onde técnicos podem acessar tudo, 
    mas usuários apenas seus próprios objetos
    """
    owner_field = 'criado_por'  # Campo que identifica o proprietário
    login_url = '/admin/login/'
    
    def dispatch(self, request, *args, **kwargs):
        """Verifica permissões antes de processar a view"""
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        
        # Técnicos têm acesso total
        if request.user.groups.filter(name='Tecnicos').exists():
            return super().dispatch(request, *args, **kwargs)
        
        # Para usuários, verificar se é proprietário do objeto
        obj = self.get_object()
        owner = getattr(obj, self.owner_field, None)
        
        if owner != request.user:
            messages.error(
                request,
                "Você só pode acessar recursos que criou."
            )
            return redirect('core:dashboard')
        
        return super().dispatch(request, *args, **kwargs)


class ViewModeToggleMixin:
    """
    Mixin para técnicos alternarem entre modo técnico e usuário
    """
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Verificar se está em modo usuário (via sessão)
        user_view_mode = self.request.session.get('user_view_mode', False)
        is_tecnico = self.request.user.groups.filter(name='Tecnicos').exists()
        
        context.update({
            'user_view_mode': user_view_mode,
            'is_tecnico': is_tecnico,
            'effective_user_mode': user_view_mode and is_tecnico,
        })
        
        return context


class AjaxResponseMixin:
    """
    Mixin para views que precisam responder a requisições AJAX
    """
    def dispatch(self, request, *args, **kwargs):
        self.is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        return super().dispatch(request, *args, **kwargs)
    
    def get_template_names(self):
        """Retorna template específico para AJAX se necessário"""
        templates = super().get_template_names()
        
        if self.is_ajax and hasattr(self, 'ajax_template_name'):
            templates.insert(0, self.ajax_template_name)
        
        return templates