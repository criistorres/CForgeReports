from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Count
from connections.models import DatabaseConnection
from reports.models import Report, ReportFolder


def home(request):
    """Página inicial - redireciona para dashboard se logado, senão mostra página de boas-vindas"""
    if request.user.is_authenticated:
        return redirect('core:dashboard')
    return render(request, 'core/home.html')


@login_required
def dashboard(request):
    """Dashboard principal - adapta conteúdo baseado no perfil do usuário"""
    context = {
        'user': request.user,
        'is_tecnico': request.user.groups.filter(name='Tecnicos').exists(),
    }
    
    if context['is_tecnico']:
        # Dashboard para técnicos - estatísticas completas
        context.update({
            'total_connections': DatabaseConnection.objects.filter(ativo=True).count(),
            'total_reports': Report.objects.filter(ativo=True).count(),
            'total_folders': ReportFolder.objects.count(),
            'recent_reports': Report.objects.filter(ativo=True).order_by('-criado_em')[:5],
            'connections': DatabaseConnection.objects.filter(ativo=True)[:5],
        })
    else:
        # Dashboard para usuários - apenas relatórios permitidos
        user_reports = Report.objects.filter(
            ativo=True,
            usuarios_permitidos=request.user
        )
        context.update({
            'available_reports': user_reports.count(),
            'recent_reports': user_reports.order_by('-atualizado_em')[:5],
            'folders_with_reports': ReportFolder.objects.filter(
                report__in=user_reports
            ).distinct()[:5],
        })
    
    return render(request, 'core/dashboard.html', context)
