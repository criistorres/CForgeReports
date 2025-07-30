from django.urls import path
from . import views

app_name = 'connections'

urlpatterns = [
    # Lista de conexões
    path('', views.ConnectionListView.as_view(), name='list'),
    
    # CRUD básico
    path('create/', views.ConnectionCreateView.as_view(), name='create'),
    path('<int:pk>/edit/', views.ConnectionUpdateView.as_view(), name='edit'),
    path('<int:pk>/delete/', views.ConnectionDeleteView.as_view(), name='delete'),
    path('<int:pk>/detail/', views.ConnectionDetailView.as_view(), name='detail'),
    
    # Teste de conexão (AJAX)
    path('<int:pk>/test/', views.TestConnectionView.as_view(), name='test'),
]