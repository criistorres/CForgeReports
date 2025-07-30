"""
URL configuration for portal_relatorios project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # Core URLs (inclui home, dashboard, auth, toggle)
    path('', include('core.urls')),
    
    # Connections URLs - FASE 3
    path('connections/', include('connections.urls')),
    
    # Future URLs para outras apps
    # path('reports/', include('reports.urls')),
    # path('users/', include('users.urls')),
]

# Servir arquivos estáticos em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Configuração do admin
admin.site.site_header = "ForgeReports - Administração"
admin.site.site_title = "ForgeReports Admin"
admin.site.index_title = "Painel Administrativo"