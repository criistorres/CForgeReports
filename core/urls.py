from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Página inicial
    path('', views.HomeView.as_view(), name='home'),
    
    # Dashboard principal
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    
    # Autenticação customizada
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('logout/', views.CustomLogoutView.as_view(), name='logout'),
    
    # Toggle entre modo técnico e usuário (AJAX)
    path('toggle-view-mode/', views.ToggleViewModeView.as_view(), name='toggle_view_mode'),
    
    # Páginas específicas para técnicos
    path('admin-panel/', views.TecnicoOnlyView.as_view(
        template_name='core/admin_panel.html'
    ), name='admin_panel'),
    
    # Páginas específicas para usuários
    path('user-panel/', views.UsuarioOnlyView.as_view(
        template_name='core/user_panel.html'
    ), name='user_panel'),
]