from django.shortcuts import render, redirect
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import messages
from django.views.generic import TemplateView
from django.urls import reverse_lazy
from django.db.models import Count
from django.http import JsonResponse
from connections.models import DatabaseConnection
from reports.models import Report, ReportFolder
from .mixins import TecnicoRequiredMixin, UsuarioRequiredMixin


class HomeView(TemplateView):
    """
    Página inicial - redireciona para dashboard se logado, 
    senão mostra página de boas-vindas
    """
    template_name = 'core/home.html'
    
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('core:dashboard')
        return super().dispatch(request, *args, **kwargs)


class DashboardView(LoginRequiredMixin, TemplateView):
    """
    Dashboard principal - adapta conteúdo baseado no perfil do usuário
    """
    template_name = 'core/dashboard.html'
    login_url = '/admin/login/'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        
        # Determinar se é técnico
        is_tecnico = user.groups.filter(name='Tecnicos').exists()
        
        context.update({
            'user': user,
            'is_tecnico': is_tecnico,
        })
        
        if is_tecnico:
            # Dashboard para técnicos - estatísticas completas
            context.update(self._get_tecnico_context())
        else:
            # Dashboard para usuários - apenas relatórios permitidos
            context.update(self._get_usuario_context(user))
        
        return context
    
    def _get_tecnico_context(self):
        """Contexto específico para técnicos"""
        return {
            'total_connections': DatabaseConnection.objects.filter(ativo=True).count(),
            'total_reports': Report.objects.filter(ativo=True).count(),
            'total_folders': ReportFolder.objects.count(),
            'recent_reports': Report.objects.filter(ativo=True).order_by('-criado_em')[:5],
            'connections': DatabaseConnection.objects.filter(ativo=True).order_by('-criado_em')[:5],
        }
    
    def _get_usuario_context(self, user):
        """Contexto específico para usuários"""
        user_reports = Report.objects.filter(
            ativo=True,
            usuarios_permitidos=user
        )
        return {
            'available_reports': user_reports.count(),
            'recent_reports': user_reports.order_by('-atualizado_em')[:5],
            'folders_with_reports': ReportFolder.objects.filter(
                report__in=user_reports
            ).distinct()[:5],
        }


class CustomLoginView(LoginView):
    """
    View de login customizada com redirecionamento baseado em perfil
    """
    template_name = 'registration/login.html'
    redirect_authenticated_user = True
    
    def get_success_url(self):
        """Redireciona baseado no perfil do usuário"""
        user = self.request.user
        
        if user.groups.filter(name='Tecnicos').exists():
            messages.success(
                self.request, 
                f'Bem-vindo, {user.get_full_name() or user.username}! Modo Técnico ativado.'
            )
        else:
            messages.success(
                self.request, 
                f'Bem-vindo, {user.get_full_name() or user.username}!'
            )
        
        return reverse_lazy('core:dashboard')


class CustomLogoutView(LogoutView):
    """
    View de logout customizada
    """
    next_page = reverse_lazy('core:home')
    
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            messages.info(request, 'Você foi desconectado com sucesso.')
        return super().dispatch(request, *args, **kwargs)


# Views específicas para técnicos
class TecnicoOnlyView(TecnicoRequiredMixin, TemplateView):
    """
    View base para funcionalidades exclusivas de técnicos
    """
    pass


# Views específicas para usuários
class UsuarioOnlyView(UsuarioRequiredMixin, TemplateView):
    """
    View base para funcionalidades específicas de usuários
    """
    pass


class ToggleViewModeView(TecnicoRequiredMixin, TemplateView):
    """
    View para alternar entre modo técnico e usuário (AJAX)
    """
    
    def post(self, request, *args, **kwargs):
        """Processa a alternância de modo via POST"""
        current_mode = request.session.get('user_view_mode', False)
        new_mode = not current_mode
        request.session['user_view_mode'] = new_mode
        
        mode_name = "Usuário" if new_mode else "Técnico"
        messages.success(
            request,
            f"Modo {mode_name} ativado com sucesso!"
        )
        
        # Se for requisição AJAX, retornar JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            from django.http import JsonResponse
            return JsonResponse({
                'success': True,
                'new_mode': mode_name,
                'user_view_mode': new_mode,
                'message': f"Modo {mode_name} ativado!"
            })
        
        return redirect('core:dashboard')
    
    def get(self, request, *args, **kwargs):
        """Redireciona GET para dashboard"""
        return redirect('core:dashboard')